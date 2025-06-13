import XSvg from "../../components/svgs/X";

const CancellationAndRefundPage = () => {
	return (
		<div className='max-w-screen-xl mx-auto flex h-screen px-10 overflow-y-auto'>
			<div className='flex-1 hidden lg:flex items-center justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-start items-start text-white pt-10 space-y-6'>
				<XSvg className='w-24 lg:hidden fill-white mb-4' />
				<h1 className='text-4xl font-extrabold'>Cancellation & Refund Policy</h1>

				<p>Since Y currently offers only free user accounts with no paid services, cancellation or refund policies are not applicable.</p>

				<p>If in future any premium feature is introduced, this section will be updated with applicable details.</p>

				<p>Have questions? Email us at <a href='mailto:contact@yashhh.tech' className='text-blue-400 underline'>contact@yashhh.tech</a>.</p>
			</div>
		</div>
	);
};

export default CancellationAndRefundPage;