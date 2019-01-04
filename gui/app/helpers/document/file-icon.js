// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function documentFileIcon(params) {
    let fileExtension = params[0].toLowerCase();
    let html = "unknown.png";

    switch (fileExtension) {
        case "7z":
        case "7zip":
        case "zipx":
        case "zip":
        case "war":
        case "rar":
        case "tar":
        case "gzip":
            html = "zip.png";
            break;
        case "avi":
        case "mov":
        case "mp4":
            html = "avi.png";
            break;

		case "html":
			html = "html.png";
            break;
		case "css":
			html = "css.png";
            break;

        case "bat":
        case "sh":
        case "ps":
        case "ps1":
        case "cs":
        case "vb":
        case "php":
        case "java":
        case "go":
        case "js":
        case "rb":
        case "py":
        case "json":
        case "config":
		case "xml":
            html = "code.png";
            break;
        case "bin":
        case "exe":
        case "dll":
            html = "bin.png";
            break;
        case "bmp":
        case "jpg":
        case "jpeg":
        case "gif":
        case "tiff":
        case "svg":
        case "png":
        case "psd":
        case "ai":
        case "sketch":
            html = "image.png";
            break;
        case "xls":
        case "xlsx":
        case "csv":
            html = "xls.png";
            break;
        case "log":
        case "txt":
        case "md":
        case "markdown":
            html = "txt.png";
            break;
        case "mp3":
        case "wav":
            html = "mp3.png";
            break;
        case "pdf":
            html = "pdf.png";
            break;
        case "ppt":
        case "pptx":
            html = "ppt.png";
            break;
        case "vsd":
        case "vsdx":
            html = "vsd.png";
            break;
        case "doc":
        case "docx":
            html = "doc.png";
            break;
        case "xslt":
    }

    return new htmlSafe(html);
}

export default helper(documentFileIcon);
