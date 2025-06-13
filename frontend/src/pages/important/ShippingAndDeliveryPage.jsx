import XSvg from "../../components/svgs/X";

const ShippingAndDeliveryPage = () => {
	return (
		<div className='max-w-screen-xl mx-auto flex h-screen px-10 overflow-y-auto'>
			<div className='flex-1 hidden lg:flex items-center justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-start items-start text-white pt-10 space-y-6'>
				<XSvg className='w-24 lg:hidden fill-white mb-4' />
				<h1 className='text-4xl font-extrabold'>Shipping & Delivery Policy</h1>

				<p>Y is a digital platform. No physical products are shipped or delivered.</p>
				<p>If digital or downloadable content is introduced, delivery details will be added accordingly.</p>
				<p>For queries, email <a href='mailto:contact@yashhh.tech' className='text-blue-400 underline'>contact@yashhh.tech</a>.</p>
			</div>
		</div>
	);
};

export default ShippingAndDeliveryPage;