import React, { useContext, useEffect, useState } from 'react';
import '../Styling/PostCss.css';
import { AiOutlineHeart, AiTwotoneHeart } from "react-icons/ai";
import { FaGlobeAmericas } from "react-icons/fa";
import { IoIosPersonAdd } from 'react-icons/io';
import axios from 'axios';
import { GeneralContext } from '../context/GeneralContextProvider';
import { useNavigate } from 'react-router-dom';

const Post = () => {
    const navigate = useNavigate();
    const { socket } = useContext(GeneralContext);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://localhost:6001/api/post/fetchAllPosts');
            const fetchedPosts = response.data;
            setPosts(fetchedPosts);
        } catch (error) {
            console.error(error);
        }
    };

    const handleLike = (userId, postId) => {
        socket.emit('postLiked', { userId, postId });
    };

    const handleUnLike = (userId, postId) => {
        socket.emit('postUnLiked', { userId, postId });
    };

    useEffect(() => {
        socket.on("likeUpdated", () => {
            // alert("likedd");
        });
        socket.on('userFollowed', ({ following }) => {
            localStorage.setItem('following', following);
        });
    }, [socket]);

    const handleFollow = async (userId) => {
        socket.emit('followUser', { ownId: localStorage.getItem('userId'), followingUserId: userId });
    };

    const [comment, setComment] = useState('');
    const handleComment = (postId, username) => {
        socket.emit('makeComment', { postId, username, comment });
    };
    
        return (
            <div className='postsContainer'>
                {posts.length > 0 ? posts.map((post) => (
                    <div className="Post" key={post._id}>
                        <div className="postTop">
                            <div className="postTopDetails">
                                <img src={post.userPic} alt="" className="userpic" />
                                <h3 className="usernameTop" onClick={() => navigate(`/profile/${post.userId}`)}>{post.userName}</h3>
                            </div>
                            {localStorage.getItem('following')?.includes(post.userId) || localStorage.getItem('userId') === post.userId ?
                                <></>
                                :
                                <IoIosPersonAdd style={{ cursor: "pointer" }} id='addFriendInPost' onClick={() => handleFollow(post.userId)} />
                            }
                        </div>
                        {post.fileType === 'photo' ?
                            <img src={post.file} className='postimg' alt="" />
                            :
                            <video id="videoPlayer" className='postimg' controls autoPlay muted>
                                <source src={post.file} />
                            </video>
                        }
                        <div className="postReact">
                            <div className="supliconcol">
                                {post.likes.includes(localStorage.getItem('userId')) ?
                                    <AiTwotoneHeart className='support reactbtn' onClick={() => handleUnLike(localStorage.getItem('userId'), post._id)} />
                                    :
                                    <AiOutlineHeart className='support reactbtn' onClick={() => handleLike(localStorage.getItem('userId'), post._id)} />
                                }
                                <label htmlFor="support" className='supportCount'>{post.likes.length}</label>
                            </div>
                            <div className="placeiconcol">
                                <FaGlobeAmericas className='placeicon reactbtn' name='place' />
                                <label htmlFor="place" className='place'>{post.location}</label>
                            </div>
                        </div>
                        <div className="detail">
                            <div className='descdataWithBtn'>
                                <label htmlFor='username' className="desc labeldata" id='desc'>
                                    <span style={{ fontWeight: 'bold' }}>
                                        {post.userName}
                                    </span>
                                    &nbsp; {post.description}
                                </label>
                            </div>
                        </div>
                        <div className="commentsContainer">
                            <div className="makeComment">
                                <input
                                    type="text"
                                    placeholder='Type something...'
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <button
                                    className='btn btn-primary'
                                    onClick={() => {
                                        if (comment.trim()) {
                                            handleComment(post._id, localStorage.getItem('username'), comment);
                                            setComment(''); // Clear the comment input
                                        }
                                    }}
                                    disabled={comment.trim().length === 0}
                                >
                                    Comment
                                </button>
                            </div>
                            <div className="commentsBody">
                                <div className="comments">
                                    {post.comments && post.comments.length > 0 ? (
                                        post.comments.map((comment, index) => (
                                            <p key={index}><b>{comment[0]}</b> {comment[1]}</p>
                                        ))
                                    ) : (
                                        <p>No comments yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )) : <p>No posts available.</p>}
            </div>
        );
    };    

export default Post;
