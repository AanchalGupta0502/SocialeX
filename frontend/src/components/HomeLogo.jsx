import { useState, useEffect, useContext } from 'react';
import logoimg from "../images/SocialeX.png";
import "../Styling/homepageLogo.css";
import { TbSearch } from "react-icons/tb";
import { GeneralContext } from "../context/GeneralContextProvider";
import Search from "../components/Search";
const HomeLogo = () => {
    const { socket } = useContext(GeneralContext);
    const [search, setSearch] = useState('');
    const [searchedUser, setSearchedUser] = useState(null);

    const handleSearch = async () => {
        if (search.trim()) {
            try {
                // Emit the search event to the server
                socket.emit('user-search', { username: search });
                setSearch(''); 
            } catch (error) {
                console.error('Error emitting search event:', error);
            }
        }
    };

    useEffect(() => {
        const handleSearchedUser = ({ user }) => {
            console.log('Received searched user:', user); 
            setSearchedUser(user);
        };

        socket.on('searched-user', handleSearchedUser);

        return () => {
            socket.off('searched-user', handleSearchedUser);
        };
    }, [socket]);

    return (
        <div className="LogoSearch">
            <img className="logoImg" src={logoimg} alt="Logo" />
            <div className="Search">
                <input
                    type="text"
                    placeholder="Search user"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="s-icon" onClick={handleSearch}>
                <TbSearch />
            </div>
            <Search searchedUser={searchedUser} setSearchedUser={setSearchedUser} />
        </div>
    );
};

export default HomeLogo;
