import React from 'react';
import "../Styling/Search.css";
import {useNavigate} from 'react-router-dom';

const Search = ({searchedUser, setSearchedUser}) => {
    const navigate = useNavigate();

    const handleUserClick = () => {
        if (searchedUser) {
            navigate(`/profile/${searchedUser._id}`);
            setSearchedUser(null);
        }
    };

    return (
        <div className="searchContainer">
            {searchedUser && (
                <div className="searchedUserInfo" onClick={handleUserClick}>
                    <img src={searchedUser.profilePic} alt={`${searchedUser.username}'s profile`} />
                    <div className="searchedUserChatInfo">
                        <span>{searchedUser.username}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;
