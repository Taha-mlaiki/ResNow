export default function AdminLoading() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            paddingTop: '4rem'
        }}>
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-e-transparent" />
                <p className="text-muted-foreground">Loading Admin Dashboard...</p>
            </div>
        </div>
    );
}
