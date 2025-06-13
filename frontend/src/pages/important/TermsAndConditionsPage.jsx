import XSvg from "../../components/svgs/X";

const TermsAndConditionsPage = () => {
	return (
		<div className='max-w-screen-xl mx-auto flex h-screen px-10 overflow-y-auto'>
			<div className='flex-1 hidden lg:flex items-center justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-start items-start text-white pt-10 space-y-6'>
				<XSvg className='w-24 lg:hidden fill-white mb-4' />
				<h1 className='text-4xl font-extrabold'>Terms and Conditions</h1>

				<p>By accessing and using Y (https://y.yashhh.tech), you agree to abide by these terms and conditions.</p>

				<h2 className='text-2xl font-bold mt-6'>1. Use of the Platform</h2>
				<p>You must be 13 years or older to use Y. You are responsible for your content and conduct on the platform.</p>

				<h2 className='text-2xl font-bold mt-6'>2. User Accounts</h2>
				<p>Maintain the confidentiality of your login credentials. Notify us immediately of unauthorized use.</p>

				<h2 className='text-2xl font-bold mt-6'>3. Prohibited Activities</h2>
				<p>No spamming, harassment, hate speech, impersonation, or illegal content is allowed.</p>

				<h2 className='text-2xl font-bold mt-6'>4. Termination</h2>
				<p>We reserve the right to terminate accounts violating these terms without prior notice.</p>

				<h2 className='text-2xl font-bold mt-6'>5. Changes</h2>
				<p>We may modify these terms at any time. Continued use indicates acceptance of the new terms.</p>

				<h2 className='text-2xl font-bold mt-6'>6. Contact</h2>
				<p>Questions? Email us at <a href='mailto:contact@yashhh.tech' className='text-blue-400 underline'>contact@yashhh.tech</a>.</p>
			</div>
		</div>
	);
};

export default TermsAndConditionsPage;