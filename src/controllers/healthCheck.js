import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

export const healthCheck = asyncHandler(async (req, res) => {
    console.log("Hey this is from healthCheck")
    return res.status(200).json(new ApiResponse(200, "namasthe", "Passed Health Check"));
})

// export const healthCheck = (req, res) => {
//     console.log("Hey this is from healthCheck");
//     return res.status(200).json({
//       status: 200,
//       data: "Hey there",
//       message: "Passed Health Check"
//     });
// };
