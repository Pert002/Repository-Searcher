import { useState, useEffect, useRef, useCallback } from 'react';
import useDebounce from '../../hooks/useDebounce';
import ReposCard from '../reposCard/repoCard';
// import { Repo } from '../../entities/repo';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchRepos, clearRepos, incrementPage } from '../../store/slices/reposSlice';
import { ERROR_CODE_TO_ERROR_MESSAGE } from '../../constans/error';
import './mainPage.css';
import './loader.css';

const MainPage = () => {
    const [user, setUser] = useState('');
    const debouncedUser = useDebounce(user, 1000);

    const dispatch = useAppDispatch();
    const { repos, isLoading, error, currentPage, hasMorePages } = useAppSelector(state => state.repos);

    const observer = useRef<IntersectionObserver | null>(null);

    const loadingTriggerRef = useRef<HTMLDivElement>(null);

    const handleLoadMore = useCallback(() => {
        if (!isLoading && hasMorePages && debouncedUser) {
            dispatch(incrementPage());
            dispatch(fetchRepos({
                userName: debouncedUser,
                page: currentPage + 1
            }));
        }
    }, [isLoading, hasMorePages, debouncedUser, currentPage, dispatch]);

    useEffect(() => {

        if (observer.current) {
            observer.current.disconnect();
        }

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMorePages && !isLoading) {
                handleLoadMore();
            }
        }, {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        });

        if (loadingTriggerRef.current) {
            observer.current.observe(loadingTriggerRef.current);
        }

        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [hasMorePages, isLoading, handleLoadMore]);

    useEffect(() => {
        if (debouncedUser.length === 0) {
            dispatch(clearRepos());
            return;
        }
        dispatch(fetchRepos({ userName: debouncedUser, page: 1 }));
    }, [debouncedUser, dispatch]);

    const handleChangeUser = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser(e.target.value);
    }


    return (
        <div className="main-page">
            <div className="main-page-container">
                <div className="main-page-wrapper">
                    <h1 className="main-page-title">Репозитории пользователя</h1>
                    <div className="main-page-input_wrapper">
                        <input
                            className="main-page-input"
                            type="text"
                            placeholder="Введите имя пользователя"
                            value={user}
                            onChange={handleChangeUser}
                        />
                        <div className="main-page-input_close" onClick={() => setUser('')}></div>
                    </div>

                </div>

                {error && debouncedUser.length > 0 ? (
                    <p className="main-page-error">{ERROR_CODE_TO_ERROR_MESSAGE[error]}</p>
                ) : (
                    <>
                        <div className="repos-grid">
                            {repos.length > 0 && debouncedUser.length > 0 &&
                                repos.map((repo) => (
                                    <ReposCard repo={repo} key={repo.id} />
                                ))
                            }
                        </div>

                        <div ref={loadingTriggerRef} className="loader-container">
                            {isLoading && <div className="loader" />}
                        </div>
                    </>
                )}
            </div>
        </div>
    )

}


export default MainPage;
