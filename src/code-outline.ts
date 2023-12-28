import { join } from "path";
import * as vscode from "vscode";

const onSchemaDocment = async (element: SchemaItem | undefined): Promise<Array<SchemaItem>> => {
  const items: Array<SchemaItem> = [];
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return items;
  }

  const content = editor.document.getText().split("\n");

  if (!element) {
    // is namespaces
    let currentline = -1; // NOTE: that it does not increment from 0, but from 1!
    const maxline = editor.document.lineCount;

    items.push(
      new SchemaItem({
        title: `⬆️ Front`,
        model: false,
        startline: currentline + 1,
        stopline: maxline,
        command: {
          command: "code-outline-schema.to",
          title: "title",
          arguments: [currentline + 1],
        },
        collapsibleState: vscode.TreeItemCollapsibleState.None,
      })
    );

    while (currentline < maxline - 1) {
      currentline = currentline + 1;
      const text = content[currentline];
      const lang = editor.document.languageId;
      let title: string = "";
      if (text.startsWith("// * ")) {
        title = "⭐ " + text.substring(5).trim();
      } else if (text.startsWith(" * --")) {
        title = "⭐ " + text.substring(5).trim();
      } else if (text.includes("<!--") && text.includes("-->")) {
        if (text.includes("<!-- <") || text.includes("<!--<")) {
          continue;
        }
        title = "⭐ " + text.split("<!--").at(-1)!.split("-->")[0].trim();
      } else if (lang === "vue" && text.startsWith("<route")) {
        title = "🔰 <Route>";
      } else if (lang === "vue" && text.startsWith("<script")) {
        title = "🔰 <Script>";
      } else if (lang === "vue" && text.startsWith("<template")) {
        title = "🔰 <Template>";
      } else if (lang === "vue" && text.startsWith("<style")) {
        title = "🔰 <Style>";
      } else if (lang === "markdown" && text.startsWith("# ")) {
        title = "🍥 " + text.substring(2).trim();
      } else if (lang === "markdown" && text.startsWith("## ")) {
        title = "🍥 " + text.substring(3).trim();
      } else if (lang === "markdown" && text.startsWith("### ")) {
        title = "🍥 > " + text.substring(4).trim();
      } else {
        continue;
      }

      items.at(-1)!.stopline = currentline - 1;

      items.push(
        new SchemaItem({
          title: title,
          model: false,
          startline: currentline,
          stopline: maxline - 1,
          command: {
            command: "code-outline-schema.to",
            title: "title",
            arguments: [currentline],
          },
          collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        })
      );
    }

    if (items.length === 1) {
      items.push(
        new SchemaItem({
          title: `🧵 No groups`,
          model: false,
          startline: 0,
          stopline: maxline - 1,
          command: {
            command: "code-outline-schema.to",
            title: "title",
            arguments: [0],
          },
          collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        })
      );
    }

    items.push(
      new SchemaItem({
        title: `⬇️ Back`,
        model: false,
        startline: maxline - 1,
        stopline: maxline - 1,
        command: {
          command: "code-outline-schema.to",
          title: "title",
          arguments: [maxline - 1],
        },
        collapsibleState: vscode.TreeItemCollapsibleState.None,
      })
    );
  } else {
    // is code item
    let currentline = element.startline - 1;
    const maxline = element.stopline;

    while (currentline < maxline) {
      currentline = currentline + 1;
      const text = content[currentline];
      const lang = editor.document.languageId;
      let title: string = "";
      if (lang === "prisma" && text.startsWith("model ")) {
        title = "💎 " + text.substring(6).trim().split(" ")[0];
        if (content[currentline - 1].startsWith("// ")) {
          title = title + " | " + content[currentline - 1].substring(3).trim();
        } else if (content[currentline - 1].startsWith("/// ")) {
          title = title + " | " + content[currentline - 1].substring(4).trim();
        }
      } else if ((lang === "typescript" || lang === "javascript") && text.startsWith("export const ")) {
        title = "💎 (export) " + text.substring(13).split("=")[0].trim();
      } else if ((lang === "typescript" || lang === "javascript") && text.startsWith("export let ")) {
        title = "💎 (export) " + text.substring(11).split("=")[0].trim();
      } else if ((lang === "typescript" || lang === "javascript") && text.startsWith("export function ")) {
        title = "💎 (export) " + text.substring(16).split("(")[0].split("<")[0].trim();
      } else if ((lang === "typescript" || lang === "javascript") && text.startsWith("export async function ")) {
        title = "💎 (export) " + text.substring(22).split("(")[0].split("<")[0].trim();
      } else if ((lang === "typescript" || lang === "javascript") && text.startsWith("const ")) {
        title = "💎 " + text.substring(6).split("=")[0].trim();
      } else if ((lang === "typescript" || lang === "javascript") && text.startsWith("let ")) {
        title = "💎 " + text.substring(4).split("=")[0].trim();
      } else if ((lang === "typescript" || lang === "javascript") && text.startsWith("function ")) {
        title = "💎 " + text.substring(9).split("(")[0].split("<")[0].trim();
      } else if ((lang === "typescript" || lang === "javascript") && text.startsWith("async function ")) {
        title = "💎 " + text.substring(15).split("(")[0].split("<")[0].trim();
      } else if (lang === "vue" && text.includes("defineProps")) {
        title = "⏬ Props";
      } else if (lang === "vue" && text.includes("defineEmits")) {
        title = "⏏️ Emits";
      } else if (lang === "vue" && text.includes(" ref(")) {
        title = "🎨 (ref) " + text.split(" ref(")[0].split(" =")[0].split(" ").at(-1)!.trim();
      } else if (lang === "vue" && text.includes(" ref<")) {
        title = "🎨 (ref) " + text.split(" ref<")[0].split(" =")[0].split(" ").at(-1)!.trim();
      } else if (lang === "vue" && text.includes(" reactive(")) {
        title = "🎨 (reactive) " + text.split(" reactive(")[0].split(" =")[0].split(" ").at(-1)!.trim();
      } else if (lang === "vue" && text.includes(" reactive<")) {
        title = "🎨 (reactive) " + text.split(" reactive<")[0].split(" =")[0].split(" ").at(-1)!.trim();
      } else if (lang === "vue" && text.startsWith("const ")) {
        title = "🎨 " + text.substring(6).split("=")[0].trim();
      } else if (lang === "vue" && text.startsWith("function ")) {
        title = "🎨 " + text.substring(9).split("(")[0].split("<")[0].trim();
      } else if (lang === "vue" && text.startsWith("async function ")) {
        title = "🎨 " + text.substring(15).split("(")[0].split("<")[0].trim();
      } else {
        continue;
      }

      items.push(
        new SchemaItem({
          title: title,
          model: true,
          startline: currentline,
          stopline: currentline,
          command: {
            command: "code-outline-schema.to",
            title: "title",
            arguments: [currentline],
          },
          collapsibleState: vscode.TreeItemCollapsibleState.None,
        })
      );
    }
  }

  return items;
};

export class SchemaProvider implements vscode.TreeDataProvider<SchemaItem> {
  constructor() {}

  getTreeItem(element: SchemaItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SchemaItem): Thenable<SchemaItem[]> {
    return onSchemaDocment(element);
  }

  private _onDidChangeTreeData: vscode.EventEmitter<SchemaItem | undefined | null | void> = new vscode.EventEmitter<
    SchemaItem | undefined | null | void
  >();
  readonly onDidChangeTreeData: vscode.Event<SchemaItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class SchemaItem extends vscode.TreeItem {
  constructor(options: {
    collapsibleState: vscode.TreeItemCollapsibleState;
    title: string;
    model: boolean;
    startline: number;
    stopline: number;
    command: any;
    iconPath?: any;
    tooltip?: string | vscode.MarkdownString | undefined;
  }) {
    super(options.title, options.collapsibleState);
    this.command = options.command;
    this.model = options.model;
    this.startline = options.startline;
    this.stopline = options.stopline;
    this.iconPath = options?.iconPath || undefined;
    this.tooltip = options?.tooltip || undefined;
  }

  model: boolean;
  startline: number;
  stopline: number;
}
