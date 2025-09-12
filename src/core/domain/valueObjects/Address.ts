export interface Address {
	street: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
	name?: string; // Added for full name
	phone?: string; // Added for phone number
	identification?: string; // Added for cédula/RUC (SRI requirement)
}
