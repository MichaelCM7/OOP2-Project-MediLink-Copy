//import Footer from './components/Footer';

export function App() {
    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
            <h1>Welcome to MediLink</h1>
            <p>This is your sample React frontend page.</p>
            <button
                onClick={() => alert('Hello from MediLink!')}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Click Me
            </button>
            {/* <Footer /> */}
        </div>
    );
}

export default App;