import User from "../models/User";

export default (email: string) => {
  return User.findOne({ email: email }).then((result) => {
    return result !== null;
  });
};
