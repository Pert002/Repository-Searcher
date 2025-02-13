import './App.css'
import MainPage from './components/mainPage/mainPage';
import { Provider } from 'react-redux';
import { store } from './store/store';
function App() {

  return (
    <Provider store={store}>
      <MainPage />
    </Provider>
  )
}

export default App;
