import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ ValidateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};
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
const loginUser = asyncHandler(async (req, res) => {
  // extract information from req.body
  // username or email
  // find the user
  // check the password
  // access and refresh token
  // send cookies

  // extract information from req.body
  const { email, username, password } = req.body;
  // username or email
  if (!username && !email) {
    throw new ApiError(400, "Username or email does not exist");
  }

  // find the user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // check the password
  const isPasswordValid = user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Password");
  }

  // access and refresh token
  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user._id
  );

  // send cookies
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in succsesslfuly"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // below we can save the refrence or not it does  not matter we only needed to delete the refresh token
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, // it means if we are saving the  refrence then we will get the updated user document not the old one where the refreshToken had some value
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(200, {}, "User Logged Out Successfully");
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshAccessToken || req.body.refreshAccessToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token has expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } = await generateAccessRefreshToken(
      user?._id
    );
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            newRefreshToken,
          },
          "Acess Token Refreshed Succuessfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
