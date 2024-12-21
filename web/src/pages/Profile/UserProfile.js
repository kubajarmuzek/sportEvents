import "./UserProfile.css";

const UserProfile = () => {
    return(
        <div className="profile-container">
            <div className="profile-tournaments">
                <div className="tournaments-upcoming">
                    <h2 className="section-headers">Upcoming tournaments</h2>

                </div>
                <div className="tournaments-past">
                    <h2 className="section-headers">Past tournaments</h2>
                
                </div>
            </div>
            <div className="profile-stats"></div>
            <div className="profile-info"></div>
        </div>
    )
}

export default UserProfile;