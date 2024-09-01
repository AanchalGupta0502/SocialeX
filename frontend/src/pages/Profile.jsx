import React, { useContext, useEffect, useState, useCallback } from 'react';
import '../Styling/ProfilePage.css';
import '../Styling/PostCss.css';
import { AiOutlineHeart, AiTwotoneHeart } from "react-icons/ai";
import { BiCommentDetail } from "react-icons/bi";
import { FaGlobeAmericas } from "react-icons/fa";
import { IoIosPersonAdd } from 'react-icons/io';
import HomeLogo from '../components/HomeLogo';
import NavigationBar from '../components/NavigationBar';
import { AuthenticationContext } from '../context/AuthenticationContextProvider';
import { GeneralContext } from '../context/GeneralContextProvider';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { logout } = useContext(AuthenticationContext);
  const { socket } = useContext(GeneralContext);
  const { id } = useParams();
  const userId = localStorage.getItem("userId");

  const [userProfile, setUserProfile] = useState('');
  const [updateProfilePic, setUpdateProfilePic] = useState('');
  const [updateProfileUsername, setUpdateProfileUsername] = useState('');
  const [updateProfileAbout, setUpdateProfileAbout] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [posts, setPosts] = useState([]);
  const [comment, setComment] = useState('');
  const [followDisplayType, setFollowDisplayType] = useState('followers');

  useEffect(() => {
    console.log('Emitting fetch-profile with id:',id);

    socket.emit("fetch-profile", { _id: id });

    socket.on("profile-fetched", ({ profile }) => {
    console.log('Recieved profile:',profile);  //log profile data
    if(profile){
      setUserProfile(profile);
      setUpdateProfilePic(profile.profilePic);
      setUpdateProfileUsername(profile.username);
      setUpdateProfileAbout(profile.about);
    }else{
      console.log("profile data is null or undefined");
    }
    });

    return () => {
      socket.off("profile-fetched");
    };
  }, [socket, id]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:6001/api/post/fetchAllPosts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleUpdate = async () => {
    socket.emit('updateProfile', { userId: userProfile._id, profilePic: updateProfilePic, username: updateProfileUsername, about: updateProfileAbout });
    setIsUpdating(false);
  };

  const handleLike = useCallback((userId, postId) => {
    socket.emit('postLiked', { userId, postId });
  }, [socket]);

  const handleUnLike = useCallback((userId, postId) => {
    socket.emit('postUnLiked', { userId, postId });
  }, [socket]);

  const handleFollow = useCallback(async (userId) => {
    socket.emit('followUser', { ownId: localStorage.getItem('userId'), followingUserId: userId });
  }, [socket]);

  const handleUnFollow = useCallback(async (userId) => {
    socket.emit('unFollowUser', { ownId: localStorage.getItem('userId'), followingUserId: userId });
  }, [socket]);

  const handleComment = useCallback((postId, username) => {
    socket.emit('makeComment', { postId, username, comment });
    setComment('');
  }, [socket, comment]);

  const handleDeletePost = useCallback(async (postId) => {
    socket.emit('delete-post', { postId });
  }, [socket]);

  useEffect(() => {
    socket.on('post-deleted', ({ posts }) => {
      setPosts(posts);
    });

    socket.on('userFollowed', ({ following }) => {
      localStorage.setItem('following', following);
    });

    socket.on('userUnFollowed', ({ following }) => {
      localStorage.setItem('following', following);
    });

    return () => {
      socket.off('post-deleted');
      socket.off('userFollowed');
      socket.off('userUnFollowed');
    };
  }, [socket]);

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className='profilePage'>
      <HomeLogo />
      <NavigationBar />

      <div className="profileCard" style={isUpdating ? { display: 'none' } : { display: "flex" }}>
        <img src={userProfile.profilePic} alt="Profile" />
        <h4>{userProfile.username}</h4>
        <p>{userProfile.about}</p>

        <div className="profileDetailCounts">
          <div className="followersCount">
            <p>Followers</p>
            <p>{userProfile.followers ? userProfile.followers.length : 0}</p>
          </div>
          <div className="followingCounts">
            <p>Following</p>
            <p>{userProfile.following ? userProfile.following.length : 0}</p>
          </div>
        </div>

        <div className="profileControls">
          {
            userProfile._id === userId ?
              <div className="profileControlBtns">
                <button onClick={async () => { await logout() }}>Logout</button>
                <button type="button" className="btn btn-primary" onClick={() => setIsUpdating(true)}>Edit</button>
              </div>
              :
              <div className="profileControlBtns">
                {
                  localStorage.getItem('following').includes(userProfile._id) ?
                    <>
                      <button onClick={() => handleUnFollow(userProfile._id)} style={{ backgroundColor: 'rgb(224, 42, 42)' }}>Unfollow</button>
                      <button>Message</button>
                    </>
                    :
                    <button onClick={() => handleFollow(userProfile._id)}>Follow</button>
                }
              </div>
          }
        </div>
      </div>

      <div className='profileEditCard' style={!isUpdating ? { display: 'none' } : { display: "flex" }}>
        <div className="mb-3">
          <label htmlFor="profilePic" className="form-label">Profile Image</label>
          <input type="text" className="form-control" id="profilePic" onChange={(e) => setUpdateProfilePic(e.target.value)} value={updateProfilePic} />
        </div>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input type="text" className="form-control" id="username" onChange={(e) => setUpdateProfileUsername(e.target.value)} value={updateProfileUsername} />
        </div>
        <div className="mb-3">
          <label htmlFor="about" className="form-label">About</label>
          <input type="text" className="form-control" id="about" onChange={(e) => setUpdateProfileAbout(e.target.value)} value={updateProfileAbout||''} />
        </div>
        <button className='btn btn-primary' onClick={handleUpdate}>Update</button>
      </div>

      <div className="profilePostsContainer">
        {posts.filter(post => post.userId === userProfile._id).map((post) => (
          <div className="Post" key={post._id}>
            <div className="postTop">
              <div className="postTopDetails">
                <img src={post.userPic} alt="User" className="userpic" />
                <h3 className="usernameTop">{post.userName}</h3>
              </div>
              {userId === post.userId && (
                <button className='btn btn-danger deletePost' onClick={() => handleDeletePost(post._id)}>Delete</button>
              )}
            </div>

            {post.fileType === 'photo' ?
              <img src={post.file} className='postimg' alt="Post" />
              :
              <video id="videoPlayer" className='postimg' controls autoPlay muted>
                <source src={post.file} />
              </video>
            }

            <div className="postReact">
              <div className="supliconcol">
                {post.likes.includes(userId) ?
                  <AiTwotoneHeart className='support reactbtn' onClick={() => handleUnLike(userId, post._id)} />
                  :
                  <AiOutlineHeart className='support reactbtn' onClick={() => handleLike(userId, post._id)} />
                }
                <label htmlFor="support" className='supportCount'>{post.likes.length}</label>
              </div>
              <BiCommentDetail className='comment reactbtn' />
              <div className="placeiconcol">
                <FaGlobeAmericas className='placeicon reactbtn' name='place' />
                <label htmlFor="place" className='place'>{post.location}</label>
              </div>
            </div>

            <div className="detail">
              <div className='descdataWithBtn'>
                <label htmlFor='username' className="desc labeldata" id='desc'>
                  <span style={{ fontWeight: 'bold' }}>{post.userName}</span> &nbsp; {post.description}
                </label>
              </div>
            </div>

            <div className="commentsContainer">
              <div className="makeComment">
                <input type="text" placeholder='type something...' onChange={(e) => setComment(e.target.value)} />
                <button className='btn btn-primary' onClick={() => handleComment(post._id, userProfile.username)} disabled={comment.length === 0}>comment</button>
              </div>
              <div className="commentsBody">
                <div className="comments">
                  {post.comments.map((comment, index) => (
                    <p key={index}><b>{comment[0]}</b> {comment[1]}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;