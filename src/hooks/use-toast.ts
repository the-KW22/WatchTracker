import * as React from 'react'

type ToastProps = {
    title: string
    description?: string
    variant?: "default" | "destructive"
}

type ToastActionElement = React.ReactElement

export function useToast(){
    const toast = ({ title, description, variant = "default" }: ToastProps) => {
        console.log(`[Toast ${variant}] ${title}: ${description}`)

        if(typeof window !== 'undefined'){
            alert(`$title\n${description || ''}`)
        }
    }

    return { toast }
}