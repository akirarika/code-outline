import { existsSync } from "fs";
import { join } from "path";
import * as vscode from "vscode";

const onSchemaDocment = async (element: SchemaItem | undefined): Promise<Array<SchemaItem>> => {
  const items: Array<SchemaItem> = [];
  const prismaSchemaPath = join(vscode.workspace.workspaceFolders?.at(0)?.uri?.fsPath ?? "", "prisma/schema.prisma");
  const prismaSchemaDocment = existsSync(prismaSchemaPath) ? vscode.workspace.openTextDocument(prismaSchemaPath) : undefined;
  const editor = vscode.window.activeTextEditor;

  let document: vscode.TextDocument;
  if (editor && (editor.document.languageId === "vue" || editor.document.languageId === "prisma")) {
    document = editor!.document;
  } else if (prismaSchemaDocment) {
    document = await prismaSchemaDocment;
  } else {
    return [];
  }

  const content = document.getText().split("\n");
  const fileTitle = document.fileName.split("/").at(-1);

  if (!element) {
    // is namespaces
    let currentline = -1; // NOTE: that it does not increment from 0, but from 1!
    const maxline = document.lineCount;

    items.push(
      new SchemaItem({
        title: `⬆️ To Front: (${fileTitle})`,
        document: document,
        model: false,
        startline: currentline + 1,
        stopline: maxline,
        command: {
          command: "code-outline-schema.to",
          title: "title",
          arguments: [document, currentline + 1],
        },
        collapsibleState: vscode.TreeItemCollapsibleState.None,
      })
    );

    while (currentline < maxline - 1) {
      currentline = currentline + 1;
      const text = content[currentline];
      const lang = document.languageId;
      let title: string = "";
      if (text.startsWith("// * ")) {
        title = "⭐ " + text.substring(5).trim();
      } else if (lang === "vue" && text.startsWith(" * --")) {
        title = "⭐ " + text.substring(5).trim();
      } else if (lang === "vue" && text.includes("<!--") && text.includes("-->")) {
        if (text.includes("<!-- <") || text.includes("<!--<")) {
          continue;
        }
        title = "⭐ " + text.split("<!--").at(-1)!.split("-->")[0].trim();
      } else if (lang === "vue" && text.endsWith(" = await defineLogic(")) {
        title = "⭐ " + text.substring(6, text.length - 34).trim();
      } else if (lang === "vue" && text.startsWith("<route")) {
        title = "🔰 <Route>";
      } else if (lang === "vue" && text.startsWith("<script")) {
        title = "🔰 <Script>";
      } else if (lang === "vue" && text.startsWith("<template")) {
        title = "🔰 <Template>";
      } else if (lang === "vue" && text.startsWith("<style")) {
        title = "🔰 <Style>";
      } else {
        continue;
      }

      items.at(-1)!.stopline = currentline - 1;

      items.push(
        new SchemaItem({
          title: title,
          document: document,
          model: false,
          startline: currentline,
          stopline: maxline - 1,
          command: {
            command: "code-outline-schema.to",
            title: "title",
            arguments: [document, currentline],
          },
          collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        })
      );
    }

    if (items.length === 1) {
      items.push(
        new SchemaItem({
          title: `🧵 No groups`,
          document: document,
          model: false,
          startline: 0,
          stopline: maxline - 1,
          command: {
            command: "code-outline-schema.to",
            title: "title",
            arguments: [document, 0],
          },
          collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
        })
      );
    }

    items.push(
      new SchemaItem({
        title: `⬇️ To Back: (${fileTitle})`,
        document: document,
        model: false,
        startline: maxline - 1,
        stopline: maxline - 1,
        command: {
          command: "code-outline-schema.to",
          title: "title",
          arguments: [document, maxline - 1],
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
      const lang = document.languageId;
      let title: string = "";
      if (lang === "prisma" && text.startsWith("model ")) {
        title = "💎 " + text.substring(6).trim().split(" ")[0];
        if (content[currentline - 1].startsWith("/// ")) {
          title = title + " | " + content[currentline - 1].substring(4).trim();
        }
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
          document: document,
          model: true,
          startline: currentline,
          stopline: currentline,
          command: {
            command: "code-outline-schema.to",
            title: "title",
            arguments: [document, currentline],
          },
          collapsibleState: vscode.TreeItemCollapsibleState.None,
        })
      );
    }
  }

  return items;
};

export class SchemaProvider implements vscode.TreeDataProvider<SchemaItem> {
  constructor() { }

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
    document: vscode.TextDocument;
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
