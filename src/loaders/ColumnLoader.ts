import {LoaderFunctionArgs, redirect} from "react-router-dom";

export const ColumnLoader = async ({ params }: LoaderFunctionArgs) => {
    const { columnName } = params;
    try {
        const response = await fetch('/data/blog/columns_config.json');
        const data = await response.json();
        const matchedColumn = data.find((b: any) => {
            return b.name === columnName; // Match with URL params
        });
        if (!matchedColumn) {
            throw redirect('/404');

        }
    } catch (e) {
        throw redirect('/404');
    }
}