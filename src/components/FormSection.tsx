export default function FormSection({ title, children }: { title: string, children: any }) {

    return (
        <fieldset>
            <legend>
                <h2 style={{ cursor: 'pointer' }}>
                    {title}
                </h2>
            </legend>
            {children}
        </fieldset>

    )
}