import { BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Courses from './pages/Courses'
import MyCourses from './pages/MyCourses'
import AddCourse from './pages/AddCourse'

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/courses' element={<Courses/>}/>
        <Route path='/my-courses' element={<MyCourses/>}/>
        <Route path='/add-course' element={<AddCourse/>}/>

      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
