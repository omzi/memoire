'use client';

import ProjectList from '#/components/ProjectList';

interface HomeProps {
	userId: string;
};

const Home = ({
	userId
}: HomeProps) => {

	return (
		<div>
			<ProjectList userId={userId} />
		</div>
	);
}

export default Home;
