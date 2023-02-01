const HEADER_SELECTOR = "#pw-header";
const CONTROLS_SELECTOR = "#pw-controls";
const MASK_SIZE = 100;

const header = document.querySelector( HEADER_SELECTOR );

const toggleMobileNav = ( ) => header.classList.toggle( "mobile-active" );

const detectOutsideHeader = e => {
	if ( !e.target.closest( HEADER_SELECTOR ) ) {
		return header.classList.remove( "mobile-active" );
	}
};

const dispatchRevealEffect = e => {
    const controls = header.querySelectorAll( CONTROLS_SELECTOR );
    
    /** @param {HTMLElement} el */
    const dispatchElement = el => { 
        const { top, left, width, height } = el.getBoundingClientRect( );
        const x = e.pageX - left - MASK_SIZE / 2, y = e.pageY - top - MASK_SIZE / 2;

        el.style.setProperty("--mask-position", `${x}px ${y}px`);
        el.style.setProperty("--mask-size", `${MASK_SIZE}px ${MASK_SIZE}px`);
    };

    controls.forEach( dispatchElement );
};

window.addEventListener( "pointermove", dispatchRevealEffect );

controls.forEach( control => { 
    const button = control.querySelector( ".pw-control-button" );

} );

document.addEventListener( "click", detectOutsideHeader );