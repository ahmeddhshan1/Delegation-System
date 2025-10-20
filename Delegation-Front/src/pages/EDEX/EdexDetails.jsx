import Delegations from "../../components/Delegations/Delegations"
import Stats from "../../components/Stats"


const EdexDetails = () => {
    return (
        <div className='content'>
            <Stats delegationNum={40} militaryDelegationNum={26} civilDelegationNum={34} memebersNum={94} />
            <Delegations />
        </div>
    )
}

export default EdexDetails