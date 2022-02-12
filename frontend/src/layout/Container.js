import './Container.css';

const Container = (props) =>{
    return(
        <div className='container'>
            <nav>
                <h1 className='header'>Space app. Rocket science :)</h1>
                <main>{props.children}</main>
            </nav>
        </div>
    );
};

export default Container;