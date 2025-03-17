const express = require('express');
const app = express();
const dotenv = require("dotenv");
const session = require('express-session');
const bodyParser = require("body-parser");
const connection = require("./config/db");
app.use('/uploads', express.static('uploads'));
const cors = require("cors");
const admin = require('firebase-admin');
const multer = require('multer');
const storages = multer.memoryStorage(); 
const nodemailer = require("nodemailer");

const serviceAccount = require("./config/social-medial-web-7773-firebase-adminsdk-fbsvc-73e8ea34a2.json"); 


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-medial-web-7773-default-rtdb.firebaseio.com",
  storageBucket: "social-medial-web-7773.appspot.com"
});


const bucket = admin.storage().bucket(); 

const db = admin.database();
app.use(cors());  
app.use(express.json()); 
app.use('/uploads', express.static('uploads'));
module.exports = { bucket }; 


app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax"  
  }
}));


app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.get("/", (req, res) => {
  if (req.session.user) {
    console.log("User session exists:", req.session.user);
    return res.redirect("/home.html"); 
  }
  res.sendFile(__dirname + "/public/index.html"); 
});




app.post("/login", (req, res) => {
  const { Mobile_no, password } = req.body;
  const query = "SELECT * FROM reg WHERE Mobile_no = ?";

  connection.query(query, [Mobile_no], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid mobile number or password" });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid mobile number or password" });
    }

    req.session.user = {
      user_id: user.user_id,
      f_name: user.f_name,
      l_name: user.l_name,
      user_photo: user.user_photo,
      Bio: user.Bio,
      Mobile_no: user.Mobile_No,
      email:user.email
    };

    console.log("Session set:", req.session.user);

    res.json({ message: "Login successful", user });
  });
});




app.post("/logout", (req, res) => {
  res.json({ message: "Logout successful" }); 
});



app.post("/registion", (req, res) => {
const { Mobile_no,email, f_name, l_name, password, } = req.body;


        console.log(req.body);
    
        connection.query(
            "INSERT INTO reg (Mobile_No, email, f_name, l_name, password) VALUES (? , ? , ?, ?, ?)",
            [Mobile_no, email,f_name, l_name, password,],
            (err, result) => {
                if (err) {
                    console.error("SQL Error:", err);
                    res.status(500).json({ error: "SQL Error", details: err.message });              
                          return;
                }
                console.log("Data inserted successfully:", result);
                res.redirect("/login.html"); 
            }
            
        );
  });




  const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          user: "ahirjd05@gmail.com", 
          pass: "rjdc pgaa evmq lygr" 
      }
  });
  
  const generateOTP = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
  };
  app.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email is required." });
    }

    connection.query("SELECT * FROM reg WHERE email = ?", [email], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.json({ success: false, message: "Database error." });
        }

        if (results.length === 0) {
            return res.json({ success: false, message: "Email not registered." });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

        connection.query(
            "UPDATE reg SET otp = ?, otp_exp_time = ? WHERE email = ?",
            [otp, otpExpiry, email],
            (updateErr, updateResults) => {
                if (updateErr) {
                    console.error("Error updating OTP in database:", updateErr);
                    return res.json({ success: false, message: "Failed to update OTP." });
                }

                const mailOptions = {
                    from: "ahirjd05@gmail.com",
                    to: email,
                    subject: "Reset Your Password OTP",
                    text: `Your OTP is: ${otp}\n\nThis OTP is valid until ${otpExpiry.toLocaleTimeString()}.\n\nDo not share it with anyone.`
                };

                transporter.sendMail(mailOptions, (mailErr, info) => {
                    if (mailErr) {
                        console.error("Error sending OTP:", mailErr);
                        return res.json({ success: false, message: "Failed to send OTP." });
                    }
                    res.json({ success: true, message: "OTP sent successfully!" });
                });
            }
        );
    });
});




app.post("/check-email", (req, res) => {
  const { email } = req.body;

  if (!email) {
      return res.json({ success: false, message: "Email is required." });
  }

  db.query("SELECT * FROM reg WHERE email = ?", [email], (err, results) => {
      if (err) {
          console.error("Database error:", err);
          return res.json({ success: false, message: "Database error." });
      }

      if (results.length === 0) {
          return res.json({ success: false, message: "Email not registered." });
      }

      res.json({ success: true, message: "Email exists in the database." });
  });
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
      return res.json({ success: false, message: "Email and OTP are required!" });
  }

  connection.query(
      "SELECT otp_exp_time > NOW() AS is_valid FROM reg WHERE email = ? AND otp = ?",
      [email, otp],
      (err, results) => {
          if (err) {
              console.error("Database error:", err);
              return res.json({ success: false, message: "Database error." });
          }

          if (results.length === 0) {
              return res.json({ success: false, message: "Invalid email or OTP." });
          }

          const { is_valid } = results[0];

          if (is_valid) {
              return res.json({ success: true, message: "OTP verified successfully!" });
          } else {
              return res.json({ success: false, message: "Invalid OTP " });
          }
      }
  );
});



app.post("/update-password", (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
      return res.json({ success: false, message: "Email and new password are required." });
  }

      connection.query("UPDATE reg SET password = ? WHERE email = ?", [newPassword, email], (err, result) => {
          if (err) {
              console.error("Database error:", err);
              return res.json({ success: false, message: "Database error." });
          }

          if (result.affectedRows === 0) {
              return res.json({ success: false, message: "User not found!" });
          }

          const mailOptions = {
              from: 'ahirjd05@gmail.com',
              to: email,
              subject: 'Password Updated Successfully',
              text: 'Your password has been successfully updated.'
          };

          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  console.error("Error sending confirmation email:", error);
                  return res.json({ success: true, message: "Password updated, but failed to send confirmation email." });
              } else {
                  console.log('Email sent: ' + info.response);
                  return res.json({ success: true, message: "Password updated successfully! A confirmation email has been sent." });
              }
          });
      });

});



app.get("/GetMsg", async (req, res) => {
    try {
        const { sender_id, receiver_id } = req.query;
  
        if (!sender_id || !receiver_id) {
            return res.status(400).json({ error: "Missing sender_id or receiver_id" });
        }
  
        const chatId1 = `${sender_id}_${receiver_id}`;
        const chatId2 = `${receiver_id}_${sender_id}`; 
  
        const messagesRef1 = db.ref(`chats/${chatId1}/messages`);
        const messagesRef2 = db.ref(`chats/${chatId2}/messages`);
  
        const snapshot1 = await messagesRef1.orderByChild('timestamp').once('value');
        const snapshot2 = await messagesRef2.orderByChild('timestamp').once('value');
  
        let messages = [];
  
        if (snapshot1.exists()) {
            const data1 = snapshot1.val();
            messages = messages.concat(Object.keys(data1).map(key => ({ ...data1[key], id: key })));
        }
  
        if (snapshot2.exists()) {
            const data2 = snapshot2.val();
            messages = messages.concat(Object.keys(data2).map(key => ({ ...data2[key], id: key })));
        }
  
        messages.sort((a, b) => a.timestamp - b.timestamp);
  
        if (messages.length === 0) {
            return res.status(404).json({ message: "No messages found" });
        }
  
        res.status(200).json(messages);
  
    } catch (error) {
        console.error("Firebase Error:", error);
        res.status(500).json({ error: "Firebase Error", details: error.message });
    }
  });


  app.get('/getPosts', (req, res) => {
    const { post_id } = req.query;
  
    let query = `
        SELECT post.post_id, post.img, reg.f_name, reg.l_name,reg.id_type, post.caption, reg.user_photo, post.likes_count, reg.user_id
        FROM post
        JOIN reg ON post.user_id = reg.user_id
    `;
  
    if (post_id) {
        query += ' WHERE post.post_id = ?';
    }
  
    connection.query(query, post_id ? [post_id] : [], (err, rows) => {
        if (err) {
            console.error('Error fetching posts:', err);
            res.status(500).json({ error: 'Error fetching posts' });
            return;
        }
  
        const postsWithDetails = rows.map(post => {
            return new Promise((resolve, reject) => {
                connection.query(
                    'SELECT reg.f_name, reg.l_name FROM likes JOIN reg ON likes.user_id = reg.user_id WHERE likes.post_id = ?',
                    [post.post_id],
                    (err, likedUsers) => {
                        if (err) {
                            console.error('Error fetching liked users:', err);
                            return reject(err);
                        }
  
                        connection.query(
                            'SELECT COUNT(*) AS comment_count FROM comments WHERE post_id = ?',
                            [post.post_id],
                            (err, commentResult) => {
                                if (err) {
                                    console.error('Error fetching comment count:', err);
                                    return reject(err);
                                }
  
                                post.likedUsers = likedUsers || [];
                                post.comment_count = commentResult[0].comment_count || 0;
                                resolve(post);
                            }
                        );
                    }
                );
            });
        });
  
        Promise.all(postsWithDetails)
            .then(posts => res.json(posts))
            .catch(err => {
                console.error('Error resolving details:', err);
                res.status(500).json({ error: 'Error resolving details' });
            });
    });
  }); 

  app.get('/getUserType', (req, res) => {
    const { user_id } = req.query;
    
    const sql = `SELECT id_type FROM reg WHERE user_id = ?`;
    connection.query(sql, [user_id], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ id_type: result[0].id_type });
    });
  });

app.get('/getFollowingWithDetails', (req, res) => {
  const { userId } = req.query;

  const sql = `
      SELECT reg.user_id, reg.f_name, reg.l_name, reg.user_photo
      FROM follows 
      JOIN reg ON follows.followed_to_id = reg.user_id
      WHERE follows.follower_by_id = ? AND follows.status = 'accepted'
  `;

    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching following list:', err);
            return res.status(500).send('Error fetching following list');
        }
        res.json({ followingDetails: results,
          followingCount: results.length 
  
         });
    });
  });
  
  
app.get('/getFollowersWithDetails', (req, res) => {
    const userId = req.query.userId;
  
    const query = `
        SELECT 
            COUNT(*) OVER() AS followersCount, 
            u.user_id, 
            u.f_name, 
            u.l_name, 
            u.user_photo 
        FROM follows f 
        JOIN reg u ON f.follower_by_id = u.user_id 
        WHERE f.followed_to_id = ? AND f.status = 'accepted'  
    `;
  
    connection.query(query, [userId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query error' });
        }
  
        const followersCount = results.length > 0 ? results[0].followersCount : 0;
  
        const followersDetails = results.map(row => ({
            user_id: row.user_id,
            f_name: row.f_name,
            l_name: row.l_name,
            user_photo: row.user_photo
        }));
  
        res.json({ followersCount, followersDetails });
    });
  });
  
  
app.get('/getSessionData', (req, res) => {
      if (req.session.user) {
          res.json({
            user_id:req.session.user.user_id,
              f_name: req.session.user.f_name,
              l_name: req.session.user.l_name,
              user_photo: req.session.user.user_photo,
              Bio: req.session.user.Bio
  
          });
      } else {
          res.status(401).json({ message: 'User not logged in' });
      }
  });
  
  app.get('/getsugesstion', (req, res) => {
    
      const query = `
          SELECT user_photo, f_name, l_name, user_id
  FROM reg
  ORDER BY user_id DESC;
  
      `;
      
      
      connection.query(query, (err, rows) => {
          if (err) {
              console.error('Error fetching suggestions:', err);
              res.status(500).json({ error: 'Error fetching suggestions' });
              return;
          }
          
          res.json(rows);
      });
  });
  
  app.post("/like", (req, res) => {
    const { post_id, user_id } = req.body;
  
    connection.query("SELECT * FROM likes WHERE user_id = ? AND post_id = ?", [user_id, post_id], (err, result) => {
      if (err) {
        console.error('Error fetching likes:', err);
        return res.status(500).json({ error: 'Error occurred while fetching likes.' });
      }
  
      if (result.length > 0) {
        connection.query("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [user_id, post_id], (err) => {
          if (err) {
            console.error('Error removing like:', err);
            return res.status(500).json({ error: 'Error occurred while removing like.' });
          }
  
          console.log('Removing like. Decreasing like count for post_id:', post_id);
  
          connection.query("UPDATE post SET likes_count = GREATEST(likes_count - 1, 0) WHERE post_id = ?", [post_id], (err) => {
            if (err) {
              console.error('Error updating like count:', err);
              return res.status(500).json({ error: 'Error occurred while updating like count.' });
            }
  
            res.json({ action: 'unlike' });
          });
        });
      } else {
        connection.query("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [user_id, post_id], (err) => {
          if (err) {
            console.error('Error adding like:', err);
            return res.status(500).json({ error: 'Error occurred while adding like.' });
          }
  
          console.log('Adding like. Increasing like count for post_id:', post_id);
  
          connection.query("UPDATE post SET likes_count = likes_count + 1 WHERE post_id = ?", [post_id], (err) => {
            if (err) {
              console.error('Error updating like count:', err);
              return res.status(500).json({ error: 'Error occurred while updating like count.' });
            }
  
            res.json({ action: 'like' });
          });
        });
      }
    });
  });
  
  app.get("/check-like", (req, res) => {
    const { post_id, user_id } = req.query;
  
    connection.query("SELECT * FROM likes WHERE user_id = ? AND post_id = ?", [user_id, post_id], (err, result) => {
      if (err) {
        console.error('Error checking like status:', err);
        return res.status(500).json({ error: 'Error occurred while checking like status.' });
      }
  
      if (result.length > 0) {
        res.json({ liked: true });  
      } else {
        res.json({ liked: false });
      }
    });
  });
   app.get('/getUserInfo', (req, res) => {
    const userId = req.query.user_id;  
    const query = `
      SELECT user_photo, f_name, l_name, user_id 
      FROM reg
      WHERE user_id = ?;
    `;
    
    connection.query(query, [userId], (err, rows) => {
      if (err) {
        console.error('Error fetching user info:', err);
        res.status(500).json({ error: 'Error fetching user info' });
        return;
      }
      
      if (rows.length > 0) {
        res.json(rows[0]); 
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    });
  }); 
  
  app.get('/getUserData/:userId', (req, res) => {
    const userId = req.params.userId;
  
    connection.query('SELECT f_name, l_name, Bio, user_photo, id_type FROM reg WHERE user_id = ?', [userId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching user data');
      }
      
      if (results.length > 0) {
        res.json(results[0]); 
      } else {
        res.status(404).send('User not found');
      }
    });
  });
  
  app.get('/getuserstory', (req, res) => {
    const userId = req.query.user_id; 
  
    const sql = `
        SELECT s.id, s.user_id, s.story_img,s.created_at, s.created_at, r.f_name,r.l_name, r.user_photo 
        FROM stories s
        JOIN reg r ON s.user_id = r.user_id
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC;
    `;
  
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching stories:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
  });
  
  app.get('/getFollowedStories', (req, res) => {
    const userId = req.query.user_id;
    
    console.log("Fetching stories for user ID:", userId); 
    const sql = `
        SELECT s.id, s.user_id, s.story_img, s.created_at, r.f_name, r.user_photo 
        FROM stories s
        JOIN reg r ON s.user_id = r.user_id
        JOIN follows f ON s.user_id = f.followed_to_id
        WHERE f.follower_by_id = ?
        ORDER BY s.created_at DESC;
    `;
  
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching followed users\' stories:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        console.log("Fetched Stories:", results);
        res.json(results);
    });
  });
  
  app.get('/getLikes', (req, res) => {
    const postId = req.query.post_id;
  
    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }
  
    const query = 'SELECT reg.user_photo, reg.f_name, reg.l_name FROM reg JOIN likes ON reg.user_id = likes.user_id WHERE likes.post_id = ?';
    connection.query(query, [postId], (err, results) => {
      if (err) {
        console.error('Error fetching likes:', err);
        return res.status(500).json({ error: 'Failed to fetch likes' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'No likes found for this post' });
      }
  
      res.json(results);  
    });
  });
  app.use(bodyParser.json());
  
  app.get('/checkFollowStatus', (req, res) => {
    const { follower_by_id, followed_to_id } = req.query;
  
    const sql = `
        SELECT status FROM follows 
        WHERE follower_by_id = ? AND followed_to_id = ?
    `;
  
    connection.query(sql, [follower_by_id, followed_to_id], (err, results) => {
        if (err) {
            console.error('Error checking follow status:', err);
            return res.status(500).json({ error: 'Database error' });
        }
  
        if (results.length > 0) {
            const status = results[0].status;
  
            if (status === 'accepted') {
                return res.json({ isFollowing: true, follow_status: 'accepted' });
            } else if (status === 'pending') {
                return res.json({ isFollowing: false, follow_status: 'pending' });
            }
        }
  
        res.json({ isFollowing: false, follow_status: null }); 
    });
  });
  
  app.get('/getPendingRequests', (req, res) => {
    const userId = req.query.userId;
  
    const sql = `
        SELECT f.id AS request_id, u.user_id, u.f_name, u.l_name, u.user_photo 
        FROM follows f 
        JOIN reg u ON f.follower_by_id = u.user_id 
        WHERE f.followed_to_id = ? AND f.status = 'pending'
    `;
  
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
    });
  });
  
  app.post('/acceptRequest', (req, res) => {
    const { requestId } = req.body;
  
    const sql = `UPDATE follows SET status = 'accepted' WHERE id = ?`;
  
    connection.query(sql, [requestId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Database update error' });
        }
        res.json({ success: true });
    });
  });
  
  app.post('/rejectRequest', (req, res) => {
    const { requestId } = req.body;
  
    const sql = `DELETE FROM follows WHERE id = ?`;
  
    connection.query(sql, [requestId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Database deletion error' });
        }
        res.json({ success: true });
    });
  });
  
  app.post('/toggleFollow', (req, res) => {
    const { follower_by_id, followed_to_id } = req.body;
  
    const sql = `SELECT id_type FROM reg WHERE user_id = ?`;
    connection.query(sql, [followed_to_id], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Database error');
      }
  
      if (result.length === 0) {
        return res.status(404).send('User not found');
      }
  
      const isPrivate = result[0].id_type === 1;
  
      const checkFollowSQL = `SELECT * FROM follows WHERE follower_by_id = ? AND followed_to_id = ?`;
      connection.query(checkFollowSQL, [follower_by_id, followed_to_id], (err, followResult) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Database error');
        }
  
        if (followResult.length > 0) {
          const deleteFollowSQL = `DELETE FROM follows WHERE follower_by_id = ? AND followed_to_id = ?`;
          connection.query(deleteFollowSQL, [follower_by_id, followed_to_id], (err) => {
            if (err) {
              console.error('Error during unfollow:', err);
              return res.status(500).send('Error while unfollowing');
            }
            return res.json({ message: 'Unfollowed successfully', status: 'unfollowed' });
          });
        } else {
          // Follow: Insert new follow record
          const status = isPrivate ? 'pending' : 'accepted';
          const insertFollowSQL = `INSERT INTO follows (follower_by_id, followed_to_id, status) VALUES (?, ?, ?)`;
          connection.query(insertFollowSQL, [follower_by_id, followed_to_id, status], (err) => {
            if (err) {
              console.error('Error during follow:', err);
              return res.status(500).send('Error while following');
            }
            return res.json({ 
              message: isPrivate ? 'Follow request sent' : 'Followed successfully', 
              status: status 
            });
          });
        }
      });
    });
  });
  
  
  
  app.post('/postComment', (req, res) => {
      const { post_id, user_id, f_name, l_name, commentText } = req.body;
    
      if (!commentText || commentText.trim() === '') {
        return res.status(400).json({ success: false, message: 'Comment text cannot be empty.' });
      }
    
      const query = "INSERT INTO comments (post_id, user_id, f_name, l_name, comment_text) VALUES (?, ?, ?, ?, ?)";
      
      connection.query(query, [post_id, user_id, f_name, l_name, commentText], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Server error while posting comment.' });
        }
        res.status(200).json({ success: true, message: 'Comment posted successfully!' });
      });
    });
  
    app.get('/getComments', (req, res) => {
      const postId = req.query.post_id;
    
      if (!postId) {
        return res.status(400).json({ error: 'Post ID is required' });
      }
    
      const query = 'SELECT reg.user_photo, reg.f_name, reg.l_name, comments.comment_text FROM reg JOIN comments ON reg.user_id = comments.user_id WHERE comments.post_id = ?;';
      connection.query(query, [postId], (err, results) => { 
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch comments' });
        }
    
        if (results.length === 0) {
          return res.status(404).json({ message: 'No comments found for this post' });
        }
    
        res.json(results);
      });
  });
  
  app.get('/getUserProfile', (req, res) => {
    const userId = req.query.userId;
  
    if (!userId) {
      return res.status(400).send({ message: 'User ID is required' });
    }
  
    const query = `
      SELECT 
        reg.user_id,
        reg.f_name,
        reg.l_name,
        reg.user_photo,
        reg.Bio,
        (SELECT COUNT(*) FROM post WHERE user_id = reg.user_id) AS post_count,
        (SELECT COUNT(*) FROM follows WHERE followed_to_id = reg.user_id) AS follower_count,
        (SELECT COUNT(*) FROM follows WHERE follower_by_id = reg.user_id) AS following_count,
        post.post_id,
        post.img,
        post.caption,
        post.likes_count,
        EXISTS(
            SELECT 1 
            FROM likes 
            WHERE likes.post_id = post.post_id AND likes.user_id = ?
        ) AS isLiked,
        (SELECT COUNT(*) 
         FROM comments 
         WHERE comments.post_id = post.post_id) AS comment_count
      FROM reg
      LEFT JOIN post ON post.user_id = reg.user_id
      WHERE reg.user_id = ?;
    `;
  
    connection.query(query, [userId, userId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error fetching user data' });
      }
  
      if (result.length === 0) {
        return res.status(404).send({ message: 'User not found' });
      }
  
      const userProfile = {
        userId: result[0].user_id,
        f_name: result[0].f_name,
        l_name: result[0].l_name,
        user_photo: result[0].user_photo,
        bio: result[0].Bio,
        post_count: result[0].post_count,
        follower_count: result[0].follower_count,
        following_count: result[0].following_count,
        posts: result
          .filter(row => row.post_id)
          .map(row => ({
            post_id: row.post_id,
            img: row.img,
            caption: row.caption,
            likes_count: row.likes_count,
            isLiked: row.isLiked === 1,
            comment_count: row.comment_count 
          })),
      };
  
      res.json(userProfile);
    });
  });
  

  
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images are allowed!'), false);
      }
    },
  });
  
  app.post('/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded. Please select an image." });
      }
  
      const fileName = `uploads/${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
      const file = bucket.file(fileName);
  
      const stream = file.createWriteStream({
        metadata: { contentType: req.file.mimetype }
      });
  
      stream.on('error', (err) => {
        console.error("🔥 Firebase Upload Error:", err);
        return res.status(500).json({ error: "Failed to upload image. Try again later." });
      });
  
      stream.on('finish', async () => {
        await file.makePublic(); 
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
  
        res.json({
          message: " Image uploaded successfully!",
          imageUrl: publicUrl
        });
      });
  
      stream.end(req.file.buffer);
  
    } catch (error) {
      console.error(" Unexpected Error:", error);
      res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });
  
  app.post('/SendMsg', upload.single('photo'), async (req, res) => {
    try {
      const { sender_id, receiver_id, message_text } = req.body;
      const file = req.file;
  
      let photoURL = null;
  
      if (file) {
        const fileName = `images/${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
        const fileUpload = bucket.file(fileName);
  
        await fileUpload.save(file.buffer, {
          metadata: { contentType: file.mimetype },
        });
  
        photoURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      }
  
      const messageData = {
        sender_id,
        receiver_id,
        message_text,
        photoURL,
        timestamp: new Date(),
      };
  
      res.status(200).json({
        success: true,
        data: messageData,
      });
  
    } catch (error) {
      console.error('Error processing message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message.',
      });
    }
  });
  
  
  
  
  app.post('/uploadPost', upload.single('post-image'), (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access. Please log in first.',
        });
    }
  
    const userId = req.session.user.user_id;
      console.log('User ID:', userId);
    const postText = req.body.caption;
    const postImage = req.file ? req.file.path : null; 
  
    const query = `INSERT INTO post (user_id, caption, img) VALUES (?, ?, ?)`;
  
    connection.query(query, [userId, postText, postImage], (err, result) => {
        if (err) {
            console.error('Error inserting post: ', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload post.',
            });
        }
  
        res.json({
            success: true,
            message: 'Post uploaded successfully',
            post: {
                userId,
                caption: postText,
                imagePath: postImage,
            },
        });
    });
  });
  

  app.post('/updateUserData/:userId', upload.single('new_user_photo'), (req, res) => {
    const userId = req.params.userId;
    const { f_name, l_name, Bio, privacy } = req.body;
    const idType = privacy === 'private' ? 0 : 1; 
    const userPhoto = req.file ? `/uploads/${req.file.filename}` : null; 
  
    connection.query(
      'UPDATE reg SET f_name = ?, l_name = ?, Bio = ?, user_photo = ?, id_type = ? WHERE user_id = ?',
      [f_name, l_name, Bio, userPhoto, idType, userId],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error updating user data');
        }
        
        res.json({
          success: true,
          user_photo: userPhoto,
          message: 'Profile updated successfully'
        });
      }
    );
  });
  app.post('/updateUser', (req, res) => {
    const { user_id, f_name, l_name, Bio, id_type } = req.body;
  
    const query = "UPDATE reg SET f_name = ?, l_name = ?, Bio = ?, id_type = ? WHERE user_id = ?";
    const values = [f_name, l_name, Bio, id_type, user_id];
  
    connection.query(query, values, (err, result) => {
        if (err) {
            console.error("Error updating user data:", err);
            res.status(500).json({ success: false, message: "Database update failed" });
        } else {
            console.log("Update result:", result);
            if (result.affectedRows > 0) {
                res.json({ success: true });
            } else {
                res.json({ success: false, message: "No rows updated" });
            }
        }
    });
  });
  
  const { Storage } = require('@google-cloud/storage');

  const storage = new Storage({
      projectId: "your-project-id",
      keyFilename: "path/to/serviceAccountKey.json" 
  });
  
  const bucketName = "your-project-id.appspot.com";
  
  const multerStorage = multer.memoryStorage(); 
  
  const upload1 = multer({ storage: multerStorage }); 

  app.post('/upload', upload1.single('file'), async (req, res) => {
      if (!req.file) return res.status(400).send('No file uploaded.');
  
      const blob = bucket.file(req.file.originalname);
      const blobStream = blob.createWriteStream({
          resumable: false,
      });
  
      blobStream.on('finish', () => {
          res.status(200).send('File uploaded successfully');
      });
  
      blobStream.end(req.file.buffer);
  });
  
  app.post("/SendMsg", upload.single("photo"), async (req, res) => {
    try {
        const { sender_id, receiver_id, message_text } = req.body;
        const file = req.file; 
        let photoURL = null;
  
        if (file) {
            const fileName = `chats/${Date.now()}_${file.originalname}`;
            const fileUpload = bucket.file(fileName);
  
            await fileUpload.save(file.buffer, {
                metadata: { contentType: file.mimetype },
            });
  
            photoURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        }
  
        const chatId = `${sender_id}_${receiver_id}`;
        const messagesRef = db.ref('chats/' + chatId + '/messages');
  
        const newMessage = {
            sender_id,
            receiver_id,
            message_text: message_text || null,
            photoURL, 
            timestamp: admin.database.ServerValue.TIMESTAMP,
        };
  
        await messagesRef.push(newMessage);
        console.log('Message pushed to Firebase successfully!');
  
        sendNotificationToReceiver(receiver_id, message_text || "📷 Sent an image");
  
        res.status(200).json({ message: "Message sent successfully", data: newMessage });
    } catch (error) {
        console.error("Firebase Error:", error);
        res.status(500).json({ error: "Firebase Error", details: error.message });
    }
  });
   
  function sendNotificationToReceiver(receiver_id, message_text) {
    const message = {
        notification: {
            title: 'New Message',
            body: message_text,
        },
        token: getReceiverToken(receiver_id), 
    };
  
    admin.messaging().send(message)
        .then((response) => {
            console.log("Notification sent successfully:", response);
        })
        .catch((error) => {
            console.error("Error sending notification:", error);
        });
  }


/* app.post("/SendMsg",(req,res)=>{
  const {sender_id,receiver_id,message_text}=req.body;

  console.log(req.body);

  connection.query(
        "INSERT INTO message (sender_id,receiver_id,message_text) VALUES (?,?,?)",
        [sender_id,receiver_id,message_text],
        (err,result)=>{
          if (err) {
          console.error("SQL Error:", err);
          res.status(500).json({ error: "SQL Error", details: err.message });              
                return;
      }
      console.log("Data inserted successfully:", result);
      res.status(200).json({ message: "Message sent successfully" }); 

  });
        });
 */

  /*       
        app.get("/GetMsg", (req, res) => {
          const { sender_id, receiver_id } = req.query;
      
          const query = `
              SELECT message_text, sender_id, receiver_id, timestamp 
              FROM message 
              WHERE (sender_id = ? AND receiver_id = ?) 
                 OR (sender_id = ? AND receiver_id = ?) 
              ORDER BY timestamp DESC;  -- Ensure ascending order
          `;
      
          connection.query(query, [sender_id, receiver_id, receiver_id, sender_id], (err, results) => {  
              if (err) {
                  console.error("SQL Error:", err);
                  res.status(500).json({ error: "SQL Error", details: err.message });
                  return;
              }
      
              res.status(200).json(results); 
          });
      });
       */
        
/* app.get('/getFollowingWithDetails', (req, res) => {
  const userId = req.query.userId;

  const query = `
      SELECT 
          COUNT(*) OVER() AS followingCount, 
          u.user_id, 
          u.f_name, 
          u.l_name, 
          u.user_photo 
      FROM follows f 
      JOIN reg u ON f.followed_to_id = u.user_id 
      WHERE f.follower_by_id = ?
  `;

  connection.query(query, [userId], (error, results) => {
      if (error) {
          return res.status(500).json({ error: 'Database query error' });
      }

      const followingCount = results.length > 0 ? results[0].followingCount : 0;

      const followingDetails = results.map(row => ({
          user_id: row.user_id,
          f_name: row.f_name,
          l_name: row.l_name,
          user_photo: row.user_photo
      }));

      res.json({ followingCount, followingDetails });
  });
}); */

/* app.get('/getFollowingWithDetails', (req, res) => {
  const userId = req.query.follower_by_id;  // This is the logged-in user's ID

  const query = `
      SELECT 
          u.user_id, 
          u.f_name, 
          u.l_name, 
          u.user_photo 
      FROM follows f 
      JOIN reg u ON f.followed_to_id = u.user_id 
      WHERE f.follower_by_id = ?
  `;

  connection.query(query, [userId], (error, results) => {
      if (error) {
          return res.status(500).json({ error: 'Database query error' });
      }

      res.json({
          following: results.map(row => ({
              user_id: row.user_id,
              f_name: row.f_name,
              l_name: row.l_name,
              user_photo: row.user_photo
          }))
      });
  });
}); */


/* app.post('/toggleFollow', (req, res) => {
  const { follower_by_id, followed_to_id } = req.body;
  

  connection.query('SELECT * FROM follows WHERE follower_by_id = ? AND followed_to_id = ?', [follower_by_id, followed_to_id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Database error');
    }

    if (result.length > 0) {
      connection.query('DELETE FROM follows WHERE follower_by_id = ? AND followed_to_id = ?', [follower_by_id, followed_to_id], (err) => {
        if (err) {
          console.error('Error during unfollow:', err);
          return res.status(500).send('Error while unfollowing');
        }
        console.log('Unfollowed successfully');
        res.json({ message: 'Unfollowed successfully' });
      });
    } else {
      connection.query('INSERT INTO follows (follower_by_id, followed_to_id) VALUES (?, ?)', [follower_by_id, followed_to_id], (err) => {
        if (err) {
          console.error('Error during follow:', err);
          return res.status(500).send('Error while following');
        }
        console.log('Followed successfully');
        res.json({ message: 'Followed successfully' });
      });
    }
  });
}); */


/* app.post('/updateUserData/:userId', upload.single('new_user_photo'), (req, res) => {
  const userId = req.params.userId;
  const { f_name, l_name, Bio } = req.body;
   const userPhoto = req.file ? `/uploads/${req.file.filename}` : null; 
 

  connection.query('UPDATE reg SET f_name = ?, l_name = ?, Bio = ?, user_photo = ? WHERE user_id = ?',
    [f_name, l_name, Bio, userPhoto, userId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error updating user data');
      }
      
      res.json({
        success: true,
        user_photo: userPhoto,
        message: 'Profile updated successfully'
      });
    }
  );
});
 */

/* app.post('/SendMsg', upload.single('photo'), async (req, res) => {
  try {
    const { sender_id, receiver_id, message_text } = req.body;
    const file = req.file;

    let photoURL = null;

    if (file) {
      const fileName = `images/${Date.now()}_${file.originalname}`;
      const fileUpload = bucket.file(fileName);

      await fileUpload.save(file.buffer, {
        metadata: { contentType: file.mimetype },
      });

      photoURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    const messageData = {
      sender_id,
      receiver_id,
      message_text,
      photoURL,
      timestamp: new Date(),
    };

    res.status(200).json({
      success: true,
      data: messageData,
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message.',
    });
  }
});

 */


/* const axios = require('axios');
const otpStorage = {};
function generateOTP() {
  console.log("55")

  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Route to send OTP
app.post('/send-otp', async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  const otp = generateOTP();
  otpStorage[mobile] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  const apiKey = 'NGQ1ODRmNGU0YzYxNzg0NDYxMzUzODc5MzUzMTYzNDg';
  const sender = 'TL'; 
  const message = `Your OTP code is ${otp}. Please do not share it.`;

  // Add country code (91 for India)
  const formattedNumber = '91' + mobile;  

  const url = `https://api.textlocal.in/send/?apikey=${apiKey}&numbers=${formattedNumber}&message=${encodeURIComponent(message)}&sender=${sender}`;

  try {
    const response = await axios.get(url);
    console.log('OTP Sent:', response.data);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Route to verify OTP
app.post('/verify-otp', (req, res) => {
  const { mobile, otp } = req.body;

  if (!otpStorage[mobile]) {
      return res.status(400).json({ success: false, message: 'OTP expired or invalid' });
  }

  if (Date.now() > otpStorage[mobile].expires) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
  }

  if (otpStorage[mobile].otp === otp) {
      delete otpStorage[mobile]; // Remove OTP after successful verification
      return res.json({ success: true, message: 'OTP verified successfully' });
  }

  res.status(400).json({ success: false, message: 'Invalid OTP' });
});

 */


app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on port ${process.env.PORT || 4000}`);
});





