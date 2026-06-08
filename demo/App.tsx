import { ConfigProvider, Layout, Switch, Tabs, TabsProps, theme, Typography } from "antd";
import { useEffect, useState } from "react";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import Compact from "./tabs/Basic.tsx";
import Default from "./tabs/Default.tsx";
import Filtering from "./tabs/Filtering.tsx";
import Priority from "./tabs/Priority.tsx";
import Validation from "./tabs/Validation.tsx";

const { Header, Content } = Layout;

const tabs: TabsProps["items"] = [
	{
		key: "default",
		label: "Default",
		children: <Default/>,
	},
	{
		key: "compact",
		label: "Compact",
		children: <Compact />,
	},
	{
		key: "priority",
		label: "Priority Countries",
		children: <Priority/>,
	},
	{
		key: "filtering",
		label: "Filtering Countries",
		children: <Filtering/>,
	},
	{
		key: "form",
		label: "Form and Validation",
		children: <Validation/>,
	},
];

export default function App() {
	const [dark, setDark] = useState(true);

	useEffect(() => {
		document.body.style.backgroundColor = dark ? "#141414" : "#fff";
	}, [dark]);

	const toggleTheme = (isDark: boolean) => {
		setDark(isDark);
	};

	return (
		<ConfigProvider theme={buildAntdTheme(dark)}>
			<Layout>
				<Header className={"demo-header"}>
					<Typography.Title style={{ flex: 1 }} level={3}>
						AntD Phone Input Demo
					</Typography.Title>
					<Switch checked={dark} onChange={toggleTheme} checkedChildren={<MoonOutlined />}
					        unCheckedChildren={<SunOutlined />} />
				</Header>
				<Content className={"demo-content"}>
					<Tabs items={tabs} />
				</Content>
			</Layout>
		</ConfigProvider>
	);
}

function buildAntdTheme(dark:boolean) {
	return {
		algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
		hashed: false,
		token: {
			fontSize: 16,
		},
	};
}