import { Link, useNavigate } from 'react-router-dom';
function Error() {
    return(
        <div>
            <h1>404 Not Found</h1>
            <br/>
            <h3>Sorry, an error has occured, Requested page not found!</h3>
            <Link to="/">Home</Link>
        </div>
    ) 
}
export default Error;