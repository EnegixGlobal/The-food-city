import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDataFromToken = (request: NextRequest) => {
    try {
        const token = request.cookies.get("token")?.value || "";
        if (!token) {
            return {
                success: false,
                message: "No token found",
            };
        }

        const decodedToken  = jwt.verify(token, process.env.JWT_SECRET!);
        if (!decodedToken) {
            return {
                success: false,
                message: "Invalid token",
            };
        }

        if (typeof decodedToken === "object" && decodedToken !== null && "id" in decodedToken) {
            return (decodedToken as jwt.JwtPayload).id;
        } else {
            return {
                success: false,
                message: "Invalid token payload",
            };
        }

    } catch (error : unknown) {
        let errorMessage = "Error in getting user data from token";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(errorMessage);
    }
}