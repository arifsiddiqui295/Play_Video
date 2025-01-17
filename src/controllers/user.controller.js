import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exist by username or email or both
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user Object - create entry in database
  // remove password and refresh token filed from  response
  // check for user creation
  // return res

  // get user details from frontend
  const { fullName, email, username, password } = req.body;
  //   console.log("email:", email);
  //   console.log("req.files: ", req.files);
  // validation - not empty
  if (
    [fullName, email, username, password].some((field) => {
      return field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All field are required");
  }

  // check if user already exist by username or email or both
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User Already exists with same email or username");
  }

  // check for images, check for avatar
  const avatarLocalpath = req.files?.avatar[0]?.path;
  //   const coverImageLocalPath = req.files?.coverImage[0]?.path;
  //   console.log("avatarLocalPath: ", avatarLocalpath);

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalpath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

//   console.log("avatar: ", avatar);
  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // create user Object - create entry in database
  const user = await User.create({
    fullName: fullName,
    username: username,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email,
    password: password,
  });

  // remove password and refresh token filed from  response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
    // -password with one space and then another field is the syntax and select function will make sure that the two fields that we have passed will not be present in the createdUser
  );

  // check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong will registering the user");
  }

  // return res
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

export { registerUser };
