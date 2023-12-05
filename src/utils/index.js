export const getElementDiamensions = (element) => {
	const width = element.clientWidth;
	const height = element.clientHeight;
	return { width, height };
};
