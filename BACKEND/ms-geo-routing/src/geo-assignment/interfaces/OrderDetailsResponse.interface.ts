export interface OrderDetailsResponse {
    id: string;
    status: string;
    storeId: number;
    userGuestId: string;
    address1: string;
    address2?: string;
    city: string;
    department: string;
    postalCode?: number;
}