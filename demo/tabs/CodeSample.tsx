import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button, theme, Typography } from "antd";
import { CheckOutlined, CopyOutlined } from "@ant-design/icons";
import { useState } from "react";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);

type CodeSampleProps = {
	code: string;
}

export default function CodeSample({ code }: CodeSampleProps) {
	const [copied, setCopied] = useState(false);
	const { token } = theme.useToken();

	const handleCopy = () => {
		setCopied(true);
		void navigator.clipboard.writeText(code);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className={"demo-sample"}>
			<Typography.Text type={"secondary"}>Code</Typography.Text>
			<Button className={"demo-copy"} shape={"circle"} onClick={handleCopy}
			        icon={
				        <span style={{ position: "relative", display: "inline-flex" }}>
						        <CopyOutlined style={{
							        position: "absolute", inset: 0,
							        opacity: copied ? 0 : 1,
							        transform: copied ? "scale(0.5)" : "scale(1)",
							        transition: "opacity 0.3s ease, transform 0.3s ease",
						        }} />
						        <CheckOutlined style={{
							        color: token.colorSuccess,
							        opacity: copied ? 1 : 0,
							        transform: copied ? "scale(1)" : "scale(0.5)",
							        transition: "opacity 0.3s ease, transform 0.3s ease",
						        }} />
					        </span>
			        }
			/>
			<SyntaxHighlighter language="typescript" style={vscDarkPlus} showLineNumbers
			                   customStyle={{ borderRadius: "8px" }}>
				{code}
			</SyntaxHighlighter>

		</div>
	);
}
