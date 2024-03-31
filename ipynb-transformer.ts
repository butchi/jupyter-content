import { defineTransformer } from '@nuxt/content/transformers'

import { unified } from 'unified'
import remarkFrontmatter from 'remark-frontmatter'
import remarkExtractFrontmatter from 'remark-extract-frontmatter'
import yaml from 'yaml'
import rehypeParse from 'rehype-parse'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { compileHast } from '@nuxtjs/mdc/runtime/parser/compiler'
import type { MarkdownNode, ParsedContent } from '@nuxt/content/types'

interface NotebookOutput {
    data: {
        'text/html': string[],
        'text/plain': string[],
    },
    execution_count: number,
    metadata: {
        'text/html': [],
        'text/plain': []
    },
    output_type: string,
}

interface Notebook {
    cells: {
        cell_type: string,
        execution_count: number,
        metadata: {
            vscode: {
                languageId: string
            }
        },
        outputs: NotebookOutput[],
        source: string[]
    }[]
}

export default defineTransformer({
    name: 'my-transformer',
    extensions: ['.ipynb'],
    parse: async (_id, content) => {
        console.log('parse: ', _id)

        const matter = {}

        if (content == null || typeof content === 'number' || typeof content === 'boolean') {
            return {
                _id,
                _type: 'json',
                body: {},
            }
        } else if (typeof content === 'string') {
            try {
                const obj = JSON.parse(content)
                const body = obj

                if (body == null) {
                    return {
                        _id,
                        _type: 'json',
                        body: {},
                    }
                }

                return {
                    _id,
                    _type: 'json',
                    body,
                } as any
            } catch (err: unknown) {
                console.log(err)

                return {
                    _id,
                    _type: 'json',
                    body: {},
                } as any
            }
        } else {
            const obj = content as Notebook

            const cellArr: MarkdownNode[] = []

            for (const cell of obj?.cells ?? []) {
                const nodeArr: MarkdownNode[] = []

                if (cell.cell_type == null) {
                } else if (cell.cell_type === 'markdown') {
                    const value = cell.source.join('\n')

                    const res = await unified()
                        .use(remarkParse)
                        .use(remarkFrontmatter, [{ type: 'yaml', marker: '-' }])
                        .use(remarkExtractFrontmatter, { yaml: yaml.parse })
                        .use(remarkRehype, { allowDangerousHtml: true })
                        .use(compileHast)
                        .process({
                            value,
                        })

                    const parseRes = res.result as ParsedContent
                    
                    Object.assign(matter, res.data)

                    nodeArr.push({
                        type: 'element',
                        tag: 'div',
                        props: {
                            class: 'source markdown',
                        },
                        children: parseRes.body?.children as MarkdownNode[],
                    })
                } else if (cell.cell_type === 'code') {
                    const value = cell.source.join('\n')

                    nodeArr.push({
                        type: 'element',
                        tag: 'div',
                        props: {
                            class: 'source code',
                        },
                        children: [{
                            type: 'element',
                            tag: 'pre',
                            props: {},
                            children: [{
                                type: 'element',
                                tag: 'code',
                                props: {},
                                children: [{
                                    type: 'text',
                                    value,
                                }],
                            }],
                        }]
                    })

                    for (const output of cell?.outputs ?? []) {
                        const outputArr: MarkdownNode[] = []
    
                        const htmlVal = (output?.data?.['text/html'] ?? []).join('')
    
                        const res = await unified()
                            .use(rehypeParse, { fragment: true })
                            .use(compileHast)
                            .process({
                                value: htmlVal,
                            })
    
                        const parsedContent = res.result as ParsedContent
    
                        const node = parsedContent.body?.children as MarkdownNode[]
    
                        outputArr.push({
                            type: 'element',
                            tag: 'div',
                            props: {
                                class: 'text html',
                            },
                            children: node,
                        })
    
                        const txtVal = (output?.data?.['text/plain'] ?? []).join('')
    
                        outputArr.push({
                            type: 'element',
                            tag: 'div',
                            props: {
                                class: 'text plain',
                            },
                            children: [{
                                type: 'text',
                                value: txtVal,
                            }],
                        })
    
                        nodeArr.push({
                            type: 'element',
                            tag: 'div',
                            props: {
                                class: 'output',
                            },
                            children: outputArr,
                        })
                    }
                }

                cellArr.push({
                    type: 'element',
                    tag: 'div',
                    props: {
                        class: 'cell',
                    },
                    children: nodeArr,
                })
            }

            return {
                ...matter,
                _id,
                _type: 'markdown',
                body: {
                    type: 'root',
                    children: cellArr,
                },
            }
        }
    }
})