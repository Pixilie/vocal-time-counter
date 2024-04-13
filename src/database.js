import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function newUser(discordname, lastJoined, time=0) {
    await prisma.user.create({
        data: {
            discordname: discordname,
            time: time,
            lastjoined: lastJoined
        }
    })
}

async function getUser(discordname) {
    const user = await prisma.user.findUnique({
        where: {
            discordname: discordname
        }
    })
    return user
}

async function updateUser(discordName, lastJoined, time) {
    if (time === null) {
        await prisma.user.update({
            where: {
                discordname: discordName
            },
            data: {
                lastjoined: lastJoined
            }
        })
    } else {
        await prisma.user.update({
            where: {
                discordname: discordName
            },
            data: {
                time: time
            }
        })
    }
}

export { newUser, getUser, updateUser }