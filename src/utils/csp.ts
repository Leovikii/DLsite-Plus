
    //Deal with Trusted Types
    export let Csp = {
        createHTML: (str) => str
    };
    if (window.isSecureContext === true && window.trustedTypes) {
        Csp = window.trustedTypes.createPolicy(
            window.trustedTypes.defaultPolicy ? "VoiceLinkTrustedTypes" : "VoiceLinkTrustedTypes",
            Csp);
    }
