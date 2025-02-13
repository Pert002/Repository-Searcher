import './repoCard.css';
import { Repo } from '../../entities/repo';

function ReposCard({ repo }: { repo: Repo }) {
    const date = new Date(repo.updated_at).toLocaleDateString();
    return (
        <div className="repo-card">

            <h2 className="repo-card-title">{repo.name}</h2>

            <p className="repo-card-description">
                {repo.description ?
                    repo.description.length < 50 ?
                        repo.description :
                        repo.description.slice(0, 50) + '...' :
                    <span className="repo-card-description-empty">Описание отсутствует</span>}
            </p>
            <a className="repo-card-link" href={repo.html_url} target="_blank" rel="noopener noreferrer">{repo.html_url}</a>
            <p className="repo-card-stars">{repo.stargazers_count} stars</p>
            <p className="repo-card-date">{date}</p>
        </div>

    )
}

export default ReposCard;
