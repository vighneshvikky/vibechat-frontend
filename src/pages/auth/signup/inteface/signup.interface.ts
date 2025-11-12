import { User } from "../../../user/models/user.model";

export interface AuthApiResponse {
    message: string,
    user: User | null
}

export interface LoginRequest {
    email: string,
    password: string
}