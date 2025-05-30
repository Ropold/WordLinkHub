import notFoundCover from '../assets/error-404.jpg';

export default function NotFound() {
    return (
        <div>
            <h2>Not Found - The Url you are looking for does not exist</h2>
            <img src={notFoundCover} alt="404 Lego" style={{ width: '500px'}}/>
        </div>
    )
}