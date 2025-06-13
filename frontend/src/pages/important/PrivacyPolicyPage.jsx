import XSvg from "../../components/svgs/X";

const PrivacyPolicyPage = () => {
	return (
		<div className='max-w-screen-xl mx-auto flex h-screen px-10 overflow-y-auto'>
			<div className='flex-1 hidden lg:flex items-center justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-start items-start text-white pt-10 space-y-6'>
				<XSvg className='w-24 lg:hidden fill-white mb-4' />
				<h1 className='text-4xl font-extrabold'>Privacy Policy</h1>
				<p><strong>Effective Date:</strong> 10 June 2025</p>

				<p>
					Welcome to <strong>Y</strong> ("we", "our", or "us"). Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our platform — a microblogging site inspired by Twitter — accessible at <a href='https://y.yashhh.tech' className='text-blue-400 underline'>https://y.yashhh.tech</a>.
				</p>

				<h2 className='text-2xl font-bold mt-6'>1. Information We Collect</h2>
				<ul className='list-disc list-inside'>
					<li><strong>Name</strong></li>
					<li><strong>Email address</strong></li>
				</ul>

				<h2 className='text-2xl font-bold mt-6'>2. How We Use Your Information</h2>
				<p>We use your data to:</p>
				<ul className='list-disc list-inside'>
					<li>Provide and maintain the platform experience.</li>
					<li>Authenticate users using JWT tokens.</li>
					<li>Send important notifications and promotional content.</li>
					<li>Improve user experience and platform reliability.</li>
				</ul>
				<p>We do <strong>not</strong> sell your data to third parties.</p>

				<h2 className='text-2xl font-bold mt-6'>3. Authentication and Cookies</h2>
				<p>We do not use third-party cookies or analytics tools. Only secure, signed JWT tokens are used for session authentication.</p>

				<h2 className='text-2xl font-bold mt-6'>4. Data Sharing</h2>
				<p>We may share your data only in the following scenarios:</p>
				<ul className='list-disc list-inside'>
					<li>With legal authorities if required by law.</li>
					<li>To protect our rights or enforce platform rules.</li>
				</ul>

				<h2 className='text-2xl font-bold mt-6'>5. Data Retention</h2>
				<p>We retain your information as long as your account is active or as required by law. You can request deletion of your data anytime via email.</p>

				<h2 className='text-2xl font-bold mt-6'>6. Children’s Privacy</h2>
				<p>Y is intended for users aged 13 and above. We do not knowingly collect data from users under 13. If you are a parent or guardian and believe your child has provided data, please contact us.</p>

				<h2 className='text-2xl font-bold mt-6'>7. Your Rights</h2>
				<ul className='list-disc list-inside'>
					<li>Access or update your information.</li>
					<li>Unsubscribe from promotional emails.</li>
					<li>Request account deletion or data erasure.</li>
				</ul>

				<p>To do so, email us at <a href='mailto:contact@yashhh.tech' className='text-blue-400 underline'>contact@yashhh.tech</a>.</p>

				<h2 className='text-2xl font-bold mt-6'>8. Security</h2>
				<p>We use industry-standard measures like HTTPS and JWT for secure authentication. However, no method is completely immune to threats online.</p>

				<h2 className='text-2xl font-bold mt-6'>9. Contact Us</h2>
				<p>If you have any questions about this policy, please reach out to us at:</p>
				<ul className='list-none'>
					<li><strong>Email:</strong> <a href='mailto:contact@yashhh.tech' className='text-blue-400 underline'>contact@yashhh.tech</a></li>
					<li><strong>Address:</strong> Gaya, Bihar</li>
					<li><strong>Team:</strong> Yashhh Tech Team</li>
				</ul>

				<h2 className='text-2xl font-bold mt-6'>10. Changes to This Policy</h2>
				<p>We may update this Privacy Policy periodically. Changes will be posted here with an updated effective date. Continued use of Y after changes means you accept the revised policy.</p>
			</div>
		</div>
	);
};

export default PrivacyPolicyPage;