import {LoaderFunctionArgs, redirect} from "react-router-dom";

export const blogLoader = async ({ params }: LoaderFunctionArgs) => {
    const { date, id } = params;
    try {
        const response = await fetch('/data/blog/blogs_config.json');
        const data = await response.json();
        const matchedBlog = data.find((b: any) => {
            const pathSegments = b.path.split('/'); // Split the path by '/'
            const extractedDate = pathSegments[1]; // Extract the date (second segment)
            const extractedId = pathSegments[2]; // Extract the id (third segment)
            return extractedDate === date && extractedId === id; // Match with URL params
        });
        if (!matchedBlog) {
            throw redirect('/404');

        }
    } catch (e) {
        throw redirect('/404');
    }
}