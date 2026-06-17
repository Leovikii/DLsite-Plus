export interface DLSiteWork {
    workno: string;
    title: string;
    circle: string;
    cv?: string[];
    tags?: string[];
    release_date?: string;
    update_date?: string;
    dl_count?: number;
    age_rating?: string;
    scenario?: string[];
    illustration?: string[];
    music?: string[];
    file_size?: string;
    isGirls?: boolean;
}

export interface PopupState {
    display: boolean;
    rjCode: string;
    isParent?: boolean;
    mouseX: number;
    mouseY: number;
    found: boolean;
    loading: boolean;
    pinned: boolean;
}
