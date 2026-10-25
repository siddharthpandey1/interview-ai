import { useContext, useState } from "react"
import { Link, NavLink, useNavigate } from "react-router"
import { AuthContext } from "../features/auth/auth.context"
import { logout } from "../features/auth/services/auth.api"
import "./navbar.scss"

const Navbar = () => {
    const { user, setUser, loading } = useContext(AuthContext)
    const [ loggingOut, setLoggingOut ] = useState(false)
    const [ logoutError, setLogoutError ] = useState("")
    const navigate = useNavigate()

    const handleLogout = async () => {
        setLoggingOut(true)
        setLogoutError("")
        try {
            await logout()
            setUser(null)
            navigate("/login")
        } catch (error) {
            setLogoutError(error.response?.data?.message || error.message || "Unable to log out.")
        } finally {
            setLoggingOut(false)
        }
    }

    return (
        <header className="app-navbar">
            <Link className="app-navbar__brand" to="/">Interview AI</Link>
            <nav aria-label="Main navigation" className="app-navbar__links">
                <NavLink end to="/">Home</NavLink>
                <NavLink to="/chat">AI Chat</NavLink>
            </nav>
            <div className="app-navbar__account">
                {!loading && (user ? (
                    <>
                        <button disabled={loggingOut} onClick={handleLogout} type="button">
                            {loggingOut ? "Logging out..." : "Logout"}
                        </button>
                        {logoutError && <span className="app-navbar__error" role="alert">{logoutError}</span>}
                    </>
                ) : (
                    <Link to="/login">Login</Link>
                ))}
            </div>
        </header>
    )
}

export default Navbar
