import { useForm } from 'react-hook-form';
import { ResetPassword } from '@/services/Auth';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { PiPasswordBold } from "react-icons/pi";
import { MdOutlinePassword } from "react-icons/md";
import ToastMessage from '@/Layout/ToastMessage';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

type PasswordFormData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const Changepassword = () => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<PasswordFormData>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const handleClickShowPassword = (field: keyof typeof showPassword) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  const onSubmit = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      ToastMessage({
        type: "error",
        message: "New Password and Confirm Password do not match!",
      });
      return;
    }

    setLoading(true);
    try {
      const resp = await ResetPassword({ oldPassword: data.oldPassword, newPassword: data.newPassword });
      setLoading(false);
      reset();
      const message = resp.data.message || "Password Change Successfully!";
      ToastMessage({
        type: "success",
        message,
      });
    } catch (error: any) {
      const errorMessage = error || "An error occurred. Please try again.";
      ToastMessage({
        type: "error",
        message: errorMessage,
      });
      setLoading(false);
    }
  };

  return (<>
    <div className="container px-5 mt-5">
      <form onSubmit={handleSubmit(onSubmit)} className='row p-3'>
        <div className="pb-4 pt-2 page-head">
          <h6 className='mt-2'>Password <span>Update</span></h6>
        </div>
        
        <div className="col-lg-6 mb-4">
          <TextField
            type={showPassword.oldPassword ? "text" : "password"}
            label="Old Password"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => handleClickShowPassword('oldPassword')}
                    edge="end"
                  >
                    {showPassword.oldPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            {...register("oldPassword", { required: "Old Password cannot be empty" })}
            error={!!errors.oldPassword}
            helperText={errors.oldPassword?.message}
            inputProps={{ maxLength: 20 }}
          />
        </div>

        <div className="col-lg-6 mb-4">
          <TextField
            type={showPassword.newPassword ? "text" : "password"}
            label="New Password"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => handleClickShowPassword('newPassword')}
                    edge="end"
                  >
                    {showPassword.newPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            {...register("newPassword", { 
              required: "New Password cannot be empty",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            })}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
            inputProps={{ maxLength: 20 }}
          />
        </div>

        <div className="col-lg-6 mb-3">
          <TextField
            type={showPassword.confirmPassword ? "text" : "password"}
            label="Confirm Password"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => handleClickShowPassword('confirmPassword')}
                    edge="end"
                  >
                    {showPassword.confirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            {...register("confirmPassword", { required: "Confirm Password cannot be empty" })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            inputProps={{ maxLength: 20 }}
          />
        </div>

        <div className='text-end'>
          <button type="submit" className="prim-but mt-3" disabled={loading}>
            {loading ? <Spinner animation="border" className='mt-1' /> : "Submit"}
          </button>
        </div>
      </form>
    </div>
  </>);
};

export default Changepassword;