import koa from 'koa';

import config from 'config';

const check = async (ctx: koa.DefaultContext, ty: string, acpi: Array<string>, accessValue: string, cr: string) => {
    if (
        ctx.request.headers['x-m2m-origin'] === config.serviceProvider.useSuperUser ||
        ctx.request.headers['x-m2m-origin'] === '/' + config.serviceProvider.useSuperUser
    ) {
        return '1';
    } else {
        if (ty == '1') {
            // check selfPrevileges
            if (acpi.length == 0) {
                const pathAndQuery = ctx.request.url.split('?');
                const pathnameWithoutQuery = pathAndQuery[0];
                acpi = [pathnameWithoutQuery];
            }
            const code = await securityCheckActionPrivileges(ctx, acpi, accessValue, cr);
            return code;
        } else if (ty == '33' || ty == '23' || ty == '4') {
            // cnt or sub --> check parents acpi to AE
            if (acpi.length == 0) {
                const targetUri = ctx.request.url.split('?')[0];
                const targetUriArray = targetUri.split('/');

                const loopContainer = 0;
                const { error, resultsacpi } = await db_sql.select_acp_cnt(loopContainer, targetUriArray);
                if (!error) {
                    if (resultsacpi.length == 0) {
                        const code = securityDefaultCheckAction(ctx, cr, accessValue);
                        return code;
                    } else {
                        const code = securityCheckActionPrivilege(ctx, resultsacpi, cr, accessValue);
                        return code;
                    }
                } else {
                    return '500-1';
                }
            } else {
                const code = securityCheckActionPrivilege(ctx, acpi, cr, accessValue);
                return code;
            }
        } else {
            if (acpi.length == 0) {
                const code = securityDefaultCheckAction(ctx, cr, accessValue);
                return code;
            } else {
                const code = securityCheckActionPrivilege(ctx, acpi, cr, accessValue);
                return code;
            }
        }
    }
};

export = { check };
