// Helper function to create standardized API responses
export const apiResponse = (statusCode: number, message: string, data: unknown = null) => {
  return Response.json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data
  }, { status: statusCode });
}
