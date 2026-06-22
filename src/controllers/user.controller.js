import { User } from "../models/User.model.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getUsers = catchAsync(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } })
    .select("username displayName avatar isOnline")
    .sort({ username: 1 });

  res.status(200).json({
    success: true,
    message: "Users retrieved",
    data: { users },
  });
});
