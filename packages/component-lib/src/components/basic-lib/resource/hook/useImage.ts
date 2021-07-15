import React from "react";

export const useImage = (src: string) => {
    const [hasLoaded, setHasLoaded] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);
    const [hasStartedInitialFetch, setHasStartedInitialFetch] = React.useState(false);


    React.useEffect(() => {
        setHasStartedInitialFetch(true);
        setHasLoaded(false);
        setHasError(false);

        // Here's where the magic happens.
        const image = new Image();
        image.src = src;
        const handleError = () => {
            setHasError(true);
        }

        const handleLoad = () => {
            setHasLoaded(true);
            setHasError(false);
        }

        image.addEventListener("error", handleError)
        image.addEventListener("load", handleLoad);


        return () => {
            image.removeEventListener("error", handleError);
            image.removeEventListener("load", handleLoad);
        };
    }, [src]);

    return {hasLoaded, hasError, hasStartedInitialFetch};
};