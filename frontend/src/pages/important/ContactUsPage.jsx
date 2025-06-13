import XSvg from "../../components/svgs/X";

const ContactUsPage = () => {
	return (
		<div className='max-w-screen-xl mx-auto flex h-screen px-10 overflow-y-auto'>
			<div className='flex-1 hidden lg:flex items-center justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-start items-start text-white pt-10 space-y-6'>
				<XSvg className='w-24 lg:hidden fill-white mb-4' />
				<h1 className='text-4xl font-extrabold'>Contact Us</h1>

				<p>If you have any questions, feedback, or support requests regarding Y, feel free to reach out to us.</p>

				<ul className='list-none'>
					<li><strong>Email:</strong> <a href='mailto:contact@yashhh.tech' className='text-blue-400 underline'>contact@yashhh.tech</a></li>
					<li><strong>Address:</strong> Gaya, Bihar</li>
					<li><strong>Team:</strong> Yashhh Tech Team</li>
				</ul>

				<p>We typically respond within 1-2 business days.</p>
			</div>
		</div>
	);
};

export default ContactUsPage;