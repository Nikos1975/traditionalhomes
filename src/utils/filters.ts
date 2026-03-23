export type ItemType = "house" | "group" | "villa";
export type PoolType = "private" | "shared" | "none" | null;
export type GroupPoolAccess = "private" | "exclusive_shared" | "shared" | "none" | null;
export type CapacityMode = "none" | "exact" | "min";

export type ListingItem = {
    id: string;
    type: ItemType;
    name: string;
    sleepsMax: number | null;
    bedrooms: number | null;
    seaView: boolean;
    pool: PoolType;
    poolAccess?: GroupPoolAccess;
    internalStairs?: boolean | null;
    entryLevel?: "ground" | "first" | null;
    members?: string[];
    isOfficialGroup?: boolean;
};

export type FilterState = {
    view: "homes" | "groups" | "all";
    capacityMode: CapacityMode;
    capacityValue: number | null;
    bedroomsMin: number | null;
    seaView: boolean;
    pool: "private" | "shared" | "none" | null;
};

export const initialFilters: FilterState = {
    view: "all",
    capacityMode: "none",
    capacityValue: null,
    bedroomsMin: null,
    seaView: false,
    pool: null,
};

export function matchesView(item: ListingItem, view: FilterState["view"]): boolean {
    if (view === "all") return true;
    if (view === "homes") return item.type === "house" || item.type === "villa";
    if (view === "groups") return item.type === "group";
    return true;
}

export function matchesCapacity(item: ListingItem, mode: CapacityMode, value: number | null): boolean {
    if (mode === "none" || value == null || item.sleepsMax == null) return true;
    if (mode === "exact") return item.sleepsMax === value;
    if (mode === "min") return item.sleepsMax >= value;
    return true;
}

export function matchesBedrooms(item: ListingItem, bedroomsMin: number | null): boolean {
    if (bedroomsMin == null) return true;
    if (item.bedrooms == null) return false;
    return item.bedrooms >= bedroomsMin;
}

export function matchesSeaView(item: ListingItem, required: boolean): boolean {
    if (!required) return true;
    return item.seaView === true;
}

export function matchesPool(item: ListingItem, poolFilter: FilterState["pool"]): boolean {
    if (poolFilter == null) return true;

    // homes + villa
    if (item.type === "house" || item.type === "villa") {
        return item.pool === poolFilter;
    }

    // groups
    if (item.type === "group") {
        const access = item.poolAccess ?? null;
        if (poolFilter === "private") {
            // "private pool" chip includes exclusive pool access for groups
            return access === "private" || access === "exclusive_shared";
        }
        if (poolFilter === "shared") {
            return access === "shared";
        }
        if (poolFilter === "none") {
            return access === "none";
        }
    }
    return false;
}

export function applyFilters(items: ListingItem[], filters: FilterState): ListingItem[] {
    return items.filter((item) => {
        return (
            matchesView(item, filters.view) &&
            matchesCapacity(item, filters.capacityMode, filters.capacityValue) &&
            matchesBedrooms(item, filters.bedroomsMin) &&
            matchesSeaView(item, filters.seaView) &&
            matchesPool(item, filters.pool)
        );
    });
}
