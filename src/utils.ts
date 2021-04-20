import * as path from 'path';

export function isParentDir(parent: string, file: string) {
    const relativePath = path.relative(parent, file);
    return relativePath && relativePath.split(path.sep)[0] !== '..' && !path.isAbsolute(relativePath);
}