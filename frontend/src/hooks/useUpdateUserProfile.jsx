import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useUpdateUserProfile = ()=>{
    const queryClient = useQueryClient();
    const {mutateAsync:updateProfile, isPending:isUpdatingProfile}=useMutation({
		mutationFn: async(formData)=>{
			try {
				const res = await fetch(`/api/user/update`,{
					method: 'POST',
					headers: {
						"Content-Type" : "application/json",
					},
					body: JSON.stringify(formData),
				})
				const data = await res.json();
                if(!res.ok){
                    throw new Error(data.error || "Something went wrong");
                }
                return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: ()=>{
			toast.success("Profile updated successfully!"),
			Promise.all([
				queryClient.invalidateQueries({queryKey : ["authUser"]}),
				queryClient.invalidateQueries({queryKey:["userProfile"]})
			])
		},
		onError: (error)=>{
            toast('Make sure each photo is less than 5MB!', {
                icon: '🫣',
              });
		}
	})
    return{updateProfile, isUpdatingProfile};
}

export default useUpdateUserProfile;